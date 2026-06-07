#!/usr/bin/env python3
"""Add 选择性必修二 & 四 units to grade11 & grade12"""
import json, os, sys
if sys.platform=='win32': import io; sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')

OUT=os.path.join(os.path.dirname(os.path.dirname(__file__)),'data','vocabulary')

def W(e,z,p='',q=''):
    return {'en':e,'zh':z,'phonetic':p,'pos':q,'example':'','exampleZh':''}

def S(name,data):
    with open(os.path.join(OUT,name),'w',encoding='utf-8') as f: json.dump(data,f,ensure_ascii=False,indent=2)
    t=sum(len(u['words']) for u in data['units'])
    print(f'{name}: {len(data["units"])} units, {t} words')

# Save typing: use raw word lists
def add_units(units, target_file, start_unit):
    with open(os.path.join(OUT,target_file),'r',encoding='utf-8') as f: data=json.load(f)
    for i,(title,words) in enumerate(units):
        data['units'].append({'unit':start_unit+i,'title':title,'words':[W(*w) for w in words]})
    S(target_file,data)

# ===== 选择性必修二 (XB2) =====
xb2 = [
    ("选必二 U1 Science and Scientists", [
        ["cholera","霍乱","/ˈkɑːlərə/","n."],["severe","极为恶劣的","/sɪˈvɪr/","adj."],
        ["frustrated","沮丧的","/frʌˈstreɪtɪd/","adj."],["contradictory","相互矛盾的","/ˌkɑːntrəˈdɪktəri/","adj."],
        ["infection","感染","/ɪnˈfekʃn/","n."],["infect","使感染","/ɪnˈfekt/","vt."],
        ["germ","微生物；细菌","/dʒɜːrm/","n."],["subscribe","订阅；同意","/səbˈskraɪb/","vi."],
        ["proof","证据","/pruːf/","n."],["multiple","多种多样的","/ˈmʌltɪpl/","adj."],
        ["pump","泵；抽水机","/pʌmp/","n."],["household","一家人","/ˈhaʊshoʊld/","n."],
        ["suspect","怀疑；嫌疑人","/səˈspekt/","vt.&n."],["blame","责备","/bleɪm/","vt.&n."],
        ["handle","处理；把手","/ˈhændl/","vt.&n."],["intervention","介入","/ˌɪntərˈvenʃn/","n."],
        ["link","联系","/lɪŋk/","n.&vt."],["raw","生的","/rɔː/","adj."],
        ["pure","纯净的","/pjʊr/","adj."],["substantial","大量的","/səbˈstænʃl/","adj."],
        ["decrease","减少","/dɪˈkriːs/","vt.&vi."],["statistic","统计数字","/stəˈtɪstɪk/","n."],
        ["transform","使改观","/trænsˈfɔːrm/","vt."],["microscope","显微镜","/ˈmaɪkrəskoʊp/","n."],
        ["thinking","思想","/ˈθɪŋkɪŋ/","n."],["protein","蛋白质","/ˈproʊtiːn/","n."],
        ["cell","细胞","/sel/","n."],["virus","病毒","/ˈvaɪrəs/","n."],
        ["finding","发现","/ˈfaɪndɪŋ/","n."],["initial","最初的","/ɪˈnɪʃl/","adj."],
        ["vaccine","疫苗","/vækˈsiːn/","n."],["framework","框架","/ˈfreɪmwɜːrk/","n."],
        ["solid","可靠的","/ˈsɑːlɪd/","adj.&n."],["cast","投射","/kæst/","vt."],
        ["shadow","阴影","/ˈʃædoʊ/","n."],["pour","倒出","/pɔːr/","v."],
        ["concrete","混凝土；确实的","/ˈkɑːnkriːt/","n.&adj."],["mechanical","机械的","/mɪˈkænɪkl/","adj."],
        ["defend","保卫","/dɪˈfend/","v."],["assistant","助理","/əˈsɪstənt/","n."],
        ["missile","导弹","/ˈmɪsl/","n."],["leadership","领导","/ˈliːdərʃɪp/","n."],
        ["trace","追溯；痕迹","/treɪs/","vt.&n."],["outstanding","杰出的","/aʊtˈstændɪŋ/","adj."],
        ["gifted","有天赋的","/ˈɡɪftɪd/","adj."],["abstract","抽象的","/ˈæbstrækt/","adj.&n."],
        ["steady","稳定的","/ˈstedi/","adj."],["concept","概念","/ˈkɑːnsept/","n."],
        ["astronomer","天文学家","/əˈstrɑːnəmər/","n."],["telescope","望远镜","/ˈtelɪskoʊp/","n."],
        ["besides","除……之外","/bɪˈsaɪdz/","prep."],["brilliant","杰出的","/ˈbrɪliənt/","adj."],
        ["furthermore","此外","/ˌfɜːrðərˈmɔːr/","adv."],["fault","过错","/fɔːlt/","n."],
        ["shift","改变","/ʃɪft/","n.&vi."],["vivid","生动的","/ˈvɪvɪd/","adj."],
    ]),
    ("选必二 U2 Bridging Cultures", [
        ["complex","复杂的","/ˈkɑːmpleks/","adj."],["recall","记起","/rɪˈkɔːl/","vt."],
        ["qualification","资格","/ˌkwɑːlɪfɪˈkeɪʃn/","n."],["ambition","野心","/æmˈbɪʃn/","n."],
        ["adaptation","适应","/ˌædæpˈteɪʃn/","n."],["comfort","安慰","/ˈkʌmfərt/","n.&vt."],
        ["tutor","导师","/ˈtuːtər/","n."],["cite","引用","/saɪt/","vt."],
        ["participation","参加","/pɑːrˌtɪsɪˈpeɪʃn/","n."],["presentation","报告","/ˌpreznˈteɪʃn/","n."],
        ["engage","参加","/ɪnˈɡeɪdʒ/","vi.&vt."],["involve","涉及","/ɪnˈvɑːlv/","vt."],
        ["edition","版次","/ɪˈdɪʃn/","n."],["zone","地区","/zoʊn/","n."],
        ["overwhelming","巨大的","/ˌoʊvərˈwelmɪŋ/","adj."],["homesickness","思乡病","/ˈhoʊmsɪknəs/","n."],
        ["motivated","积极的","/ˈmoʊtɪveɪtɪd/","adj."],["motivation","动力","/ˌmoʊtɪˈveɪʃn/","n."],
        ["advisor","顾问","/ədˈvaɪzər/","n."],["reasonable","合理的","/ˈriːznəbl/","adj."],
        ["expectation","期望","/ˌekspekˈteɪʃn/","n."],["applicant","申请人","/ˈæplɪkənt/","n."],
        ["firm","公司","/fɜːrm/","n.&adj."],["exposure","接触","/ɪkˈspoʊʒər/","n."],
        ["insight","洞察力","/ˈɪnsaɪt/","n."],["departure","离开","/dɪˈpɑːrtʃər/","n."],
        ["setting","环境","/ˈsetɪŋ/","n."],["grasp","理解","/ɡræsp/","vt."],
        ["dramatic","巨大的","/drəˈmætɪk/","adj."],["expense","费用","/ɪkˈspens/","n."],
        ["tremendous","极大的","/trɪˈmendəs/","adj."],["behave","表现","/bɪˈheɪv/","vt.&vi."],
        ["surroundings","环境","/səˈraʊndɪŋz/","n."],["mature","成熟的","/məˈtʃʊr/","adj."],
        ["depressed","沮丧的","/dɪˈprest/","adj."],["boom","繁荣","/buːm/","vi.&n."],
        ["strengthen","加强","/ˈstreŋθn/","vi.&vt."],["deny","否认","/dɪˈnaɪ/","vt."],
        ["optimistic","乐观的","/ˌɑːptɪˈmɪstɪk/","adj."],["gain","获得","/ɡeɪn/","vt."],
        ["perspective","角度","/pərˈspektɪv/","n."],["competence","能力","/ˈkɑːmpɪtəns/","n."],
        ["cooperate","合作","/koʊˈɑːpəreɪt/","vi."],["angle","角度","/ˈæŋɡl/","n."],
        ["outlook","前景","/ˈaʊtlʊk/","n."],["belt","腰带；地带","/belt/","n."],
        ["initiative","倡议","/ɪˈnɪʃətɪv/","n."],["budget","预算","/ˈbʌdʒɪt/","n."],
        ["logical","合乎逻辑的","/ˈlɑːdʒɪkl/","adj."],["outcome","结果","/ˈaʊtkʌm/","n."],
    ]),
    ("选必二 U3 Food and Culture", [
        ["cuisine","菜肴","/kwɪˈziːn/","n."],["prior","先前的","/ˈpraɪər/","adj."],
        ["consist","由……组成","/kənˈsɪst/","vi."],["pepper","甜椒；胡椒粉","/ˈpepər/","n."],
        ["recipe","食谱","/ˈresəpi/","n."],["bold","大胆的","/boʊld/","adj."],
        ["chef","厨师","/ʃef/","n."],["vinegar","醋","/ˈvɪnɪɡər/","n."],
        ["stuff","填满","/stʌf/","vt.&n."],["slice","薄片","/slaɪs/","n.&vt."],
        ["onion","洋葱","/ˈʌnjən/","n."],["lamb","羊羔肉","/læm/","n."],
        ["elegant","精美的","/ˈelɪɡənt/","adj."],["exceptional","特别的","/ɪkˈsepʃənl/","adj."],
        ["minimum","最小值","/ˈmɪnɪməm/","n."],["consume","消耗","/kənˈsuːm/","vt."],
        ["temper","脾气","/ˈtempər/","n."],["vegetarian","素食者","/ˌvedʒəˈteriən/","n."],
        ["garlic","蒜","/ˈɡɑːrlɪk/","n."],["bacon","熏猪肉","/ˈbeɪkən/","n."],
        ["ham","火腿","/hæm/","n."],["sausage","香肠","/ˈsɔːsɪdʒ/","n."],
        ["cabbage","卷心菜","/ˈkæbɪdʒ/","n."],["brand","品牌","/brænd/","n."],
        ["olive","橄榄","/ˈɑːlɪv/","n."],["ingredient","材料","/ɪnˈɡriːdiənt/","n."],
        ["dessert","甜点","/dɪˈzɜːrt/","n."],["dough","生面团","/doʊ/","n."],
        ["stable","稳定的","/ˈsteɪbl/","adj."],["canteen","食堂","/kænˈtiːn/","n."],
        ["cafeteria","自助餐厅","/ˌkæfəˈtɪriə/","n."],["pork","猪肉","/pɔːrk/","n."],
        ["somewhat","有点","/ˈsʌmwʌt/","adv."],["calorie","卡路里","/ˈkæləri/","n."],
        ["association","协会","/əˌsoʊsiˈeɪʃn/","n."],["regardless","不顾","/rɪˈɡɑːrdləs/","adv."],
        ["category","类别","/ˈkætəɡɔːri/","n."],["vitamin","维生素","/ˈvaɪtəmɪn/","n."],
        ["fibre","纤维","/ˈfaɪbər/","n."],["quantity","数量","/ˈkwɑːntəti/","n."],
        ["dairy","奶制的","/ˈderi/","adj.&n."],["moderation","适度","/ˌmɑːdəˈreɪʃn/","n."],
        ["ideal","理想的","/aɪˈdiːəl/","adj.&n."],["fundamental","基本的","/ˌfʌndəˈmentl/","adj."],
        ["chew","咀嚼","/tʃuː/","vi.&vt."],["consistent","一致的","/kənˈsɪstənt/","adj."],
        ["modest","谦虚的","/ˈmɑːdɪst/","adj."],["trick","诀窍","/trɪk/","n."],
        ["overall","总体上","/ˌoʊvərˈɔːl/","adv.&adj."],
    ]),
]
add_units(xb2, 'grade11.json', 8)
print("grade11 updated!")

# Also add remaining XB2 units 4-5
xb2b = [
    ("选必二 U4 Journey Across a Vast Land", [
        ["airline","航空公司","/ˈerlaɪn/","n."],["bay","湾","/beɪ/","n."],["craft","手艺","/kræft/","n."],
        ["antique","古董","/ænˈtiːk/","n.&adj."],["pleasant","令人愉快的","/ˈpleznt/","adj."],["arise","出现","/əˈraɪz/","vi."],
        ["massive","巨大的","/ˈmæsɪv/","adj."],["literally","真正地","/ˈlɪtərəli/","adv."],["breath","呼吸","/breθ/","n."],
        ["bound","前往","/baʊnd/","adj."],["scenery","风景","/ˈsiːnəri/","n."],["awesome","令人惊叹的","/ˈɔːsəm/","adj."],
        ["spectacular","壮观的","/spekˈtækjələr/","adj."],["peak","顶峰","/piːk/","n."],["highlight","突出","/ˈhaɪlaɪt/","vt.&n."],
        ["goat","山羊","/ɡoʊt/","n."],["freezing","极冷的","/ˈfriːzɪŋ/","adj."],["mall","购物商场","/mɔːl/","n."],
        ["anticipate","预料","/ænˈtɪsɪpeɪt/","vt."],["bunch","束；串","/bʌntʃ/","n."],["thunder","打雷","/ˈθʌndər/","vi."],
        ["frost","霜","/frɔːst/","n."],["curtain","窗帘","/ˈkɜːrtn/","n."],["border","边界","/ˈbɔːrdər/","n."],
        ["duration","持续时间","/duˈreɪʃn/","n."],["harbour","港口","/ˈhɑːrbər/","n."],["idiom","习语","/ˈɪdiəm/","n."],
        ["contrary","相反的","/ˈkɑːntreri/","adj."],["anyhow","不过","/ˈenihaʊ/","adv."],["alongside","在旁边","/əˌlɔːŋˈsaɪd/","prep."],
        ["proceed","继续","/proʊˈsiːd/","vi."],["shore","岸","/ʃɔːr/","n."],["astonish","使吃惊","/əˈstɑːnɪʃ/","vt."],
        ["mist","薄雾","/mɪst/","n."],["steel","钢","/stiːl/","n."],["dusk","黄昏","/dʌsk/","n."],
        ["advertisement","广告","/ˌædvərˈtaɪzmənt/","n."],["accent","口音","/ˈæksent/","n."],["photographer","摄影师","/fəˈtɑːɡrəfər/","n."],
        ["owe","欠","/oʊ/","vt."],["toast","烤面包；干杯","/toʊst/","n."],["coherent","有条理的","/koʊˈhɪrənt/","adj."],
    ]),
    ("选必二 U5 First Aid", [
        ["technique","技术","/tekˈniːk/","n."],["leaflet","传单","/ˈliːflət/","n."],["organ","器官","/ˈɔːrɡən/","n."],
        ["toxin","毒素","/ˈtɑːksɪn/","n."],["ray","光线","/reɪ/","n."],["radiation","辐射","/ˌreɪdiˈeɪʃn/","n."],
        ["acid","酸","/ˈæsɪd/","n."],["millimetre","毫米","/ˈmɪlimiːtər/","n."],["minor","次要的","/ˈmaɪnər/","adj."],
        ["layer","层","/ˈleɪər/","n."],["electric","电的","/ɪˈlektrɪk/","adj."],["victim","受害者","/ˈvɪktɪm/","n."],
        ["swollen","肿胀的","/ˈswoʊlən/","adj."],["blister","水疱","/ˈblɪstər/","n."],["underneath","在底下","/ˌʌndərˈniːθ/","prep."],
        ["nerve","神经","/nɜːrv/","n."],["fabric","织物","/ˈfæbrɪk/","n."],["loose","松的","/luːs/","adj."],
        ["urgent","紧急的","/ˈɜːrdʒənt/","adj."],["ease","缓解","/iːz/","vt.&n."],["paramedic","急救医生","/ˌpærəˈmedɪk/","n."],
        ["swallow","吞下","/ˈswɑːloʊ/","vt."],["wrap","包","/ræp/","vt."],["slip","滑倒","/slɪp/","vi."],
        ["mosquito","蚊子","/məˈskiːtoʊ/","n."],["elderly","上了年纪的","/ˈeldərli/","adj."],["carpet","地毯","/ˈkɑːrpɪt/","n."],
        ["operator","接线员","/ˈɑːpəreɪtər/","n."],["ambulance","救护车","/ˈæmbjələns/","n."],["delay","推迟","/dɪˈleɪ/","vt.&n."],
        ["needle","针","/ˈniːdl/","n."],["ward","病房","/wɔːrd/","n."],["drown","淹死","/draʊn/","vi.&vt."],
        ["sprain","扭伤","/spreɪn/","vt.&n."],["ankle","踝","/ˈæŋkl/","n."],["bleeding","流血","/ˈbliːdɪŋ/","n."],
        ["panic","恐慌","/ˈpænɪk/","n."],["interrupt","打断","/ˌɪntəˈrʌpt/","vt."],["scream","尖叫","/skriːm/","vi."],
        ["fellow","同类的","/ˈfeloʊ/","adj.&n."],["choke","窒息","/tʃoʊk/","vi."],["steak","牛排","/steɪk/","n."],
        ["throat","喉咙","/θroʊt/","n."],["desperate","绝望的","/ˈdespərət/","adj."],["slap","拍打","/slæp/","vt."],
        ["practical","切实可行的","/ˈpræktɪkl/","adj."],["obstruction","阻塞","/əbˈstrʌkʃn/","n."],
    ]),
]
add_units(xb2b, 'grade11.json', 11)

# ===== 选择性必修四 Unit1 =====
xb4 = [
    ("选必四 U1 Science Fiction", [
        ["fiction","小说","/ˈfɪkʃn/","n."],["test out","测试","","phr."],["bonus","奖金","/ˈboʊnəs/","n."],
        ["ridiculous","荒谬的","/rɪˈdɪkjələs/","adj."],["integrity","诚信","/ɪnˈteɡrəti/","n."],["dignity","尊严","/ˈdɪɡnəti/","n."],
        ["salary","薪水","/ˈsæləri/","n."],["absurd","荒谬的","/əbˈsɜːrd/","adj."],["appointment","预约","/əˈpɔɪntmənt/","n."],
        ["nail","指甲；钉子","/neɪl/","n."],["guilty","内疚的","/ˈɡɪlti/","adj."],["suspend","暂停","/səˈspend/","vt."],
        ["ladder","梯子","/ˈlædər/","n."],["dismiss","解散","/dɪsˈmɪs/","vt."],["declare","宣称","/dɪˈkler/","vt."],
        ["whereas","然而","/ˌwerˈæz/","conj."],["rumour","谣言","/ˈruːmər/","n."],["presume","假设","/prɪˈzuːm/","vt."],
        ["fare","车费","/fer/","n."],["weekly","每周的","/ˈwiːkli/","adj."],["calculate","计算","/ˈkælkjuleɪt/","vt."],
        ["gramme","克","/ɡræm/","n."],["flour","面粉","/ˈflaʊər/","n."],["venue","场地","/ˈvenjuː/","n."],
        ["alien","外星人","/ˈeɪliən/","n.&adj."],["superior","更好的","/suːˈpɪriər/","adj."],["inaction","不行动","/ɪnˈækʃn/","n."],
        ["labour","劳动","/ˈleɪbər/","n."],["leather","皮革","/ˈleðər/","n."],["lever","操纵杆","/ˈliːvər/","n."],
        ["panel","控制板","/ˈpænl/","n."],["inch","英寸","/ɪntʃ/","n."],["backwards","向后","/ˈbækwərdz/","adv."],
        ["grip","紧握","/ɡrɪp/","vt."],["hazy","模糊的","/ˈheɪzi/","adj."],["niece","侄女","/niːs/","n."],
        ["fetch","拿来","/fetʃ/","vt."],["lamp","灯","/læmp/","n."],["turn out","结果是","","phr."],
        ["pace","速度","/peɪs/","n."],["division","分开","/dɪˈvɪʒn/","n."],["urge","冲动；催促","/ɜːrdʒ/","n.&vt."],
        ["random","随机的","/ˈrændəm/","adj."],["maximum","最大","/ˈmæksɪməm/","adj.&n."],["explode","爆炸","/ɪkˈsploʊd/","vi."],
        ["jolt","震动","/dʒoʊlt/","n."],["flip","翻转","/flɪp/","vt."],["stun","使震惊","/stʌn/","vt."],
        ["mud","泥","/mʌd/","n."],["overstatement","夸大","/ˈoʊvərsteɪtmənt/","n."],["handkerchief","手帕","/ˈhæŋkərtʃɪf/","n."],
    ]),
]
add_units(xb4, 'grade12.json', 4)
print("All done!")
