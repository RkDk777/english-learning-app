#!/usr/bin/env python3
"""Build complete grade7.json from structured word lists"""
import json, os, sys

# Ensure UTF-8 on Windows
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'vocabulary', 'grade7.json')

def W(en, zh, ph, pos, ex, ex_zh):
    return {"en":en,"zh":zh,"phonetic":ph,"pos":pos,"example":ex,"exampleZh":ex_zh}

print("Generating grade7.json...")

starter = [
    W("good","好的","/ɡʊd/","adj.","Good morning!","早上好！"),
    W("morning","早晨；上午","/ˈmɔːnɪŋ/","n.","Good morning!","早上好！"),
    W("hi","嗨；喂","/haɪ/","interj.","Hi! How are you?","嗨！你好吗？"),
    W("hello","你好；喂","/həˈloʊ/","interj.","Hello! Nice to meet you.","你好！很高兴见到你。"),
    W("afternoon","下午","/ˌæftərˈnuːn/","n.","Good afternoon!","下午好！"),
    W("evening","晚上；傍晚","/ˈiːvnɪŋ/","n.","Good evening!","晚上好！"),
    W("how","怎样；如何","/haʊ/","adv.","How are you?","你好吗？"),
    W("are","是","/ɑːr/","v.","How are you?","你好吗？"),
    W("you","你；你们","/juː/","pron.","How are you?","你好吗？"),
    W("I","我","/aɪ/","pron.","I am fine.","我很好。"),
    W("am","是","/æm/","v.","I am a student.","我是一名学生。"),
    W("fine","健康的；美好的","/faɪn/","adj.","I'm fine, thanks.","我很好，谢谢。"),
    W("thanks","感谢；谢谢","/θæŋks/","interj. & n.","Thanks for your help.","谢谢你的帮助。"),
    W("OK","好；可以","/ˌoʊˈkeɪ/","interj. & adv.","That's OK.","没关系。"),
    W("what","什么","/wɑːt/","pron.","What is this?","这是什么？"),
    W("is","是","/ɪz/","v.","What is your name?","你叫什么名字？"),
    W("this","这；这个","/ðɪs/","pron.","This is a pen.","这是一支笔。"),
    W("in","用；在……里","/ɪn/","prep.","Write it in English.","用英语写。"),
    W("English","英语","/ˈɪŋɡlɪʃ/","n. & adj.","I like English.","我喜欢英语。"),
    W("map","地图","/mæp/","n.","There is a map on the wall.","墙上有一张地图。"),
    W("cup","杯子","/kʌp/","n.","I have a cup of tea.","我有一杯茶。"),
    W("ruler","尺子","/ˈruːlər/","n.","Please use a ruler.","请用尺子。"),
    W("pen","笔；钢笔","/pen/","n.","May I use your pen?","我可以用你的笔吗？"),
    W("jacket","夹克衫","/ˈdʒækɪt/","n.","He wears a black jacket.","他穿着黑色夹克。"),
    W("color","颜色","/ˈkʌlər/","n.","What color is it?","它是什么颜色？"),
    W("red","红色的","/red/","adj.","The apple is red.","苹果是红色的。"),
    W("yellow","黄色的","/ˈjeloʊ/","adj.","The banana is yellow.","香蕉是黄色的。"),
    W("green","绿色的","/ɡriːn/","adj.","The trees are green.","树是绿色的。"),
    W("blue","蓝色的","/bluː/","adj.","The sky is blue.","天空是蓝色的。"),
    W("black","黑色的","/blæk/","adj.","My hair is black.","我的头发是黑色的。"),
    W("white","白色的","/waɪt/","adj.","Snow is white.","雪是白色的。"),
    W("purple","紫色的","/ˈpɜːrpl/","adj.","She wears a purple dress.","她穿着紫色裙子。"),
    W("brown","棕色的","/braʊn/","adj.","I have a brown bag.","我有一个棕色包。"),
    W("the","这/那个；这/那些","/ðə/","art.","The book is on the desk.","书在书桌上。"),
    W("now","现在；目前","/naʊ/","adv.","I'm busy now.","我现在很忙。"),
    W("see","看见；明白","/siː/","v.","I can see a bird.","我能看见一只鸟。"),
    W("can","能；可以","/kæn/","modal v.","Can you help me?","你能帮我吗？"),
    W("say","说；讲","/seɪ/","v.","Please say it again.","请再说一遍。"),
    W("my","我的","/maɪ/","pron.","This is my book.","这是我的书。"),
    W("spell","拼写","/spel/","v.","How do you spell your name?","你的名字怎么拼？"),
    W("please","请","/pliːz/","interj.","Please sit down.","请坐。"),
]

print(f"   Starter: {len(starter)} words")

# Write the file incrementally
data = {
    "grade": "七年级",
    "semester": "全学年（上+下册）",
    "textbook": "人教版 Go for it! (2012审定版)",
    "units": [{"unit": 0, "title": "Starter Units 1-3", "words": starter}]
}

print("   Saving initial file...")
with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
print(f"   Done! {len(starter)} words in starter unit")
print(f"Saved to: {OUT}")
