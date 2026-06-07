"""Reorganize high school vocabulary into 7 individual book files."""
import json, os, sys
if sys.platform=='win32': import io; sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')

BASE=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(BASE,'data','vocabulary')
os.makedirs(OUT,exist_ok=True)

def load(name):
    with open(os.path.join(OUT,name),'r',encoding='utf-8') as f: return json.load(f)
def save(name,data):
    with open(os.path.join(OUT,name),'w',encoding='utf-8') as f: json.dump(data,f,ensure_ascii=False,indent=2)
    t=sum(len(u['words']) for u in data['units'])
    print(f'  {name}: {len(data["units"])} units, {t} words')

g10=load('grade10.json')
g11=load('grade11.json')
g12=load('grade12.json')

# Book 1 (必修一): g10 units 0-5
b1={'grade':'必修 第一册','textbook':'2019人教版高中英语','units':[]}
for u in g10['units']:
    if u['unit']<=5:
        u2=dict(u)
        u2['title']=u2['title'].replace('Unit ','')
        if u2['unit']==0: u2['unit']='Welcome'
        else: u2['unit']=u2['unit']
        b1['units'].append(u2)
save('book_b1.json',b1)

# Book 2 (必修二): g10 units 6-10
b2={'grade':'必修 第二册','textbook':'2019人教版高中英语','units':[]}
for u in g10['units']:
    if 6<=u['unit']<=10:
        u2=dict(u)
        u2['title']=u2['title'].replace('Unit ','')
        u2['unit']=u2['unit']-5
        b2['units'].append(u2)
save('book_b2.json',b2)

# Book 3 (必修三): g10 units 11-15
b3={'grade':'必修 第三册','textbook':'2019人教版高中英语','units':[]}
for u in g10['units']:
    if u['unit']>=11:
        u2=dict(u)
        u2['title']=u2['title'].replace('Unit ','')
        u2['unit']=u2['unit']-10
        b3['units'].append(u2)
save('book_b3.json',b3)

# XB1 (选择性必修一): g11 units 1-5
xb1={'grade':'选择性必修 第一册','textbook':'2019人教版高中英语','units':[]}
for u in g11['units']:
    if u['unit']<=5:
        u2=dict(u)
        u2['title']=u2['title'].replace('Unit ','')
        u2['unit']=u2['unit']
        xb1['units'].append(u2)
save('book_xb1.json',xb1)

# XB2 (选择性必修二): g11 units 8-12
xb2={'grade':'选择性必修 第二册','textbook':'2019人教版高中英语','units':[]}
for u in g11['units']:
    if 8<=u['unit']<=12:
        u2=dict(u)
        u2['title']=u2['title'].replace('Unit ','')
        u2['unit']=u2['unit']-7
        xb2['units'].append(u2)
save('book_xb2.json',xb2)

# XB3 (选择性必修三): g11 U6-7 + g12 U1-3
xb3={'grade':'选择性必修 第三册','textbook':'2019人教版高中英语','units':[]}
idx=1
# g11 U6=Art, U7=Healthy Lifestyle
for u in g11['units']:
    if u['unit'] in [6,7]:
        u2=dict(u)
        u2['title']=u2['title'].replace('Unit ','')
        u2['unit']=idx; idx+=1
        xb3['units'].append(u2)
# g12 U1=Env, U2=Adversity, U3=Poems
for u in g12['units']:
    if u['unit']<=3:
        u2=dict(u)
        u2['title']=u2['title'].replace('Unit ','')
        u2['unit']=idx; idx+=1
        xb3['units'].append(u2)
save('book_xb3.json',xb3)

# XB4 (选择性必修四): g12 U4
xb4={'grade':'选择性必修 第四册','textbook':'2019人教版高中英语','units':[]}
for u in g12['units']:
    if u['unit']==4:
        u2=dict(u)
        u2['title']=u2['title'].replace('Unit ','')
        u2['unit']=1
        xb4['units'].append(u2)
save('book_xb4.json',xb4)

# Keep grade10-12 as copies for now, then clean up
for f in ['grade10.json','grade11.json','grade12.json']:
    os.remove(os.path.join(OUT,f))
    print(f'  Removed {f}')

print('\nDone! 7 high school books created.')
