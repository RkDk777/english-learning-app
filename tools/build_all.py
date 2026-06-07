#!/usr/bin/env python3
"""Build complete vocabulary for all grades (初一-高三)"""
import json, os, sys

if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(BASE, 'data', 'vocabulary')

def W(*a):
    return {"en":a[0],"zh":a[1],"phonetic":a[2] if len(a)>2 else "","pos":a[3] if len(a)>3 else "","example":a[4] if len(a)>4 else "","exampleZh":a[5] if len(a)>5 else ""}

def save(name, data):
    path = os.path.join(OUT, name)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    total = sum(len(u["words"]) for u in data["units"])
    print(f"  {name}: {len(data['units'])} units, {total} words")

# ============================================================
# 初一 (七年级) — already have grade7.json, just update labels
# ============================================================
with open(os.path.join(OUT, 'grade7.json'), 'r', encoding='utf-8') as f:
    g7 = json.load(f)
g7["grade"] = "初一（七年级）"
g7["semester"] = "全学年（上+下册）"
g7["textbook"] = "人教版 Go for it! (2012审定版)"
# Remove "about X words" from titles
for u in g7["units"]:
    u["title"] = u["title"].replace("上册 ","").replace("下册 ","")
save("grade7.json", g7)

# ============================================================
# 初二 (八年级) 上册10单元 + 下册10单元
# ============================================================
g8u1 = [
    W("anyone","任何人","/ˈeniwʌn/","pron.","Did you meet anyone?","你遇到什么人了吗？"),
    W("anywhere","在任何地方","/ˈeniweər/","adv.","I can't find it anywhere.","我哪儿都找不到。"),
    W("wonderful","精彩的","/ˈwʌndərfl/","adj.","We had a wonderful time.","我们玩得很开心。"),
    W("few","不多；很少","/fjuː/","adj. & pron.","Quite a few.","相当多。"),
    W("most","最多；大多数","/moʊst/","adj. & pron.","Most students like it.","大多数学生喜欢它。"),
    W("something","某事；某物","/ˈsʌmθɪŋ/","pron.","I have something to tell you.","我有事要告诉你。"),
    W("nothing","没有什么","/ˈnʌθɪŋ/","pron.","Nothing is impossible.","没有什么不可能。"),
    W("everyone","每人；人人","/ˈevriwʌn/","pron.","Everyone is here.","大家都到了。"),
    W("myself","我自己","/maɪˈself/","pron.","I did it by myself.","我自己做的。"),
    W("yourself","你自己","/jɔːrˈself/","pron.","Help yourself.","请自便。"),
    W("hen","母鸡","/hen/","n.","The hen laid an egg.","母鸡下了个蛋。"),
    W("pig","猪","/pɪɡ/","n.","They raise pigs on the farm.","他们在农场养猪。"),
    W("seem","好像；似乎","/siːm/","v.","You seem happy.","你似乎很开心。"),
    W("bored","厌倦的；烦闷的","/bɔːrd/","adj.","I feel bored.","我感到无聊。"),
    W("someone","某人","/ˈsʌmwʌn/","pron.","Someone is waiting.","有人在等。"),
    W("diary","日记","/ˈdaɪəri/","n.","I keep a diary.","我写日记。"),
    W("enjoyable","令人愉快的","/ɪnˈdʒɔɪəbl/","adj.","An enjoyable trip.","愉快的旅程。"),
    W("activity","活动","/ækˈtɪvəti/","n.","After-school activities.","课外活动。"),
    W("decide","决定","/dɪˈsaɪd/","v.","I decided to go.","我决定去。"),
    W("try","尝试；努力","/traɪ/","v. & n.","Try your best.","尽力而为。"),
    W("paragliding","滑翔伞运动","/ˈpærəɡlaɪdɪŋ/","n.","I tried paragliding.","我尝试了滑翔伞。"),
    W("bird","鸟","/bɜːrd/","n.","A bird can fly.","鸟会飞。"),
    W("bicycle","自行车","/ˈbaɪsɪkl/","n.","Ride a bicycle.","骑自行车。"),
    W("building","建筑物","/ˈbɪldɪŋ/","n.","A tall building.","高楼。"),
    W("trader","商人","/ˈtreɪdər/","n.","A street trader.","街头商人。"),
    W("wonder","想知道","/ˈwʌndər/","v.","I wonder why.","我想知道为什么。"),
    W("difference","差别；差异","/ˈdɪfrəns/","n.","Make a difference.","产生影响。"),
    W("top","顶部","/tɑːp/","n.","At the top of the hill.","在山顶。"),
    W("wait","等待","/weɪt/","v.","Wait for me.","等等我。"),
    W("umbrella","雨伞","/ʌmˈbrelə/","n.","Take an umbrella.","带把伞。"),
    W("wet","湿的","/wet/","adj.","My clothes are wet.","我的衣服湿了。"),
    W("below","在……下面","/bɪˈloʊ/","prep. & adv.","Below the surface.","在表面之下。"),
    W("enough","足够的","/ɪˈnʌf/","adj. & adv.","Enough time.","足够的时间。"),
    W("hungry","饥饿的","/ˈhʌŋɡri/","adj.","I'm hungry.","我饿了。"),
    W("as","当……时；作为","/æz/","conj.","As a student.","作为学生。"),
    W("hill","小山","/hɪl/","n.","Climb a hill.","爬山。"),
    W("duck","鸭子","/dʌk/","n.","A duck in the pond.","池塘里的鸭子。"),
    W("dislike","不喜爱","/dɪsˈlaɪk/","v. & n.","I dislike it.","我不喜欢。"),
]
g8u2 = [
    W("housework","家务劳动","/ˈhaʊswɜːrk/","n.","Do housework.","做家务。"),
    W("hardly","几乎不","/ˈhɑːrdli/","adv.","I hardly ever eat junk food.","我几乎不吃垃圾食品。"),
    W("ever","曾经","/ˈevər/","adv.","Have you ever been there?","你去过那里吗？"),
    W("once","一次","/wʌns/","adv.","Once a week.","每周一次。"),
    W("twice","两次","/twaɪs/","adv.","Twice a week.","每周两次。"),
    W("Internet","互联网","/ˈɪntərnet/","n.","On the Internet.","在互联网上。"),
    W("program","节目；程序","/ˈproʊɡræm/","n.","A TV program.","电视节目。"),
    W("full","满的；忙的","/fʊl/","adj.","I'm full.","我饱了。"),
    W("swing","摇摆；秋千","/swɪŋ/","v. & n.","On the swing.","在秋千上。"),
    W("maybe","大概；或许","/ˈmeɪbi/","adv.","Maybe tomorrow.","也许明天。"),
    W("least","最少；最小","/liːst/","adj. & adv.","At least.","至少。"),
    W("junk","无用的东西","/dʒʌŋk/","n.","Junk food.","垃圾食品。"),
    W("coffee","咖啡","/ˈkɔːfi/","n.","A cup of coffee.","一杯咖啡。"),
    W("health","健康","/helθ/","n.","Good health.","健康。"),
    W("result","结果","/rɪˈzʌlt/","n.","The result is good.","结果很好。"),
    W("percent","百分之……","/pərˈsent/","n.","Eighty percent.","百分之八十。"),
    W("online","在线的","/ˌɑːnˈlaɪn/","adj. & adv.","Online shopping.","网上购物。"),
    W("television","电视","/ˈtelɪvɪʒn/","n.","Watch television.","看电视。"),
    W("although","虽然","/ɔːlˈðoʊ/","conj.","Although it rained, we went.","虽然下雨，我们还是去了。"),
    W("through","穿过；凭借","/θruː/","prep.","Through the window.","透过窗户。"),
    W("mind","头脑；介意","/maɪnd/","n. & v.","Never mind.","没关系。"),
    W("body","身体","/ˈbɑːdi/","n.","A healthy body.","健康的身体。"),
    W("such","这样的","/sʌtʃ/","adj.","Such a nice day.","如此美好的一天。"),
    W("together","一起","/təˈɡeðər/","adv.","Let's go together.","我们一起去。"),
    W("die","消失；死亡","/daɪ/","v.","Old habits die hard.","旧习难改。"),
    W("writer","作者；作家","/ˈraɪtər/","n.","A famous writer.","著名作家。"),
    W("dentist","牙医","/ˈdentɪst/","n.","See a dentist.","看牙医。"),
    W("magazine","杂志","/ˌmæɡəˈziːn/","n.","A fashion magazine.","时尚杂志。"),
    W("however","然而","/haʊˈevər/","adv.","However, I disagree.","然而我不同意。"),
    W("than","比","/ðæn/","conj.","Better than yesterday.","比昨天好。"),
    W("almost","几乎","/ˈɔːlmoʊst/","adv.","Almost finished.","快完成了。"),
    W("none","没有一个","/nʌn/","pron.","None of them.","一个都没有。"),
    W("less","较少；更少","/les/","adj. & adv.","Less than ten.","不到十个。"),
    W("point","得分；指向","/pɔɪnt/","n. & v.","That's the point.","这才是重点。"),
]
g8u3 = [
    W("outgoing","外向的","/ˈaʊtɡoʊɪŋ/","adj.","She is outgoing.","她很外向。"),
    W("better","更好的","/ˈbetər/","adj. & adv.","Better than me.","比我好。"),
    W("loudly","大声地","/ˈlaʊdli/","adv.","Speak loudly.","大声说。"),
    W("quietly","安静地","/ˈkwaɪətli/","adv.","Walk quietly.","安静地走。"),
    W("hard-working","工作努力的","/ˌhɑːrd ˈwɜːrkɪŋ/","adj.","A hard-working student.","勤奋的学生。"),
    W("competition","比赛；竞赛","/ˌkɑːmpəˈtɪʃn/","n.","A singing competition.","歌唱比赛。"),
    W("fantastic","极好的","/fænˈtæstɪk/","adj.","Fantastic job!","太棒了！"),
    W("which","哪一个","/wɪtʃ/","adj. & pron.","Which one?","哪一个？"),
    W("clearly","清楚地","/ˈklɪrli/","adv.","Speak clearly.","说清楚。"),
    W("win","赢；获胜","/wɪn/","v.","Win the game.","赢得比赛。"),
    W("though","虽然；不过","/ðoʊ/","conj. & adv.","Even though.","即使。"),
    W("talented","有才能的","/ˈtæləntɪd/","adj.","A talented musician.","有才华的音乐家。"),
    W("truly","真正；确实","/ˈtruːli/","adv.","I'm truly sorry.","我真的很抱歉。"),
    W("care","在意；关心","/ker/","v.","I care about you.","我关心你。"),
    W("serious","严肃的","/ˈsɪriəs/","adj.","Are you serious?","你是认真的吗？"),
    W("mirror","镜子","/ˈmɪrər/","n.","Look in the mirror.","照镜子。"),
    W("kid","小孩","/kɪd/","n.","A little kid.","小孩。"),
    W("necessary","必需的","/ˈnesəseri/","adj.","It's necessary.","这是必要的。"),
    W("both","两个（都）","/boʊθ/","adj. & pron.","Both of us.","我们俩。"),
    W("grade","成绩等级","/ɡreɪd/","n.","Get a good grade.","取得好成绩。"),
    W("should","应该","/ʃʊd/","modal v.","You should study.","你应该学习。"),
    W("saying","谚语；格言","/ˈseɪɪŋ/","n.","An old saying.","老话。"),
    W("reach","伸手；到达","/riːtʃ/","v.","Reach the top.","到达顶点。"),
    W("hand","手","/hænd/","n.","Raise your hand.","举手。"),
    W("touch","触摸；感动","/tʌtʃ/","v.","Don't touch.","不要碰。"),
    W("heart","内心；心脏","/hɑːrt/","n.","Follow your heart.","追随你的心。"),
    W("fact","事实","/fækt/","n.","In fact.","事实上。"),
    W("break","使破；裂","/breɪk/","v.","Break a glass.","打破杯子。"),
    W("arm","手臂","/ɑːrm/","n.","Break an arm.","手臂骨折。"),
    W("share","分享；共用","/ʃer/","v.","Share with friends.","与朋友分享。"),
    W("loud","大声的","/laʊd/","adj.","Loud music.","大声的音乐。"),
    W("similar","类似的","/ˈsɪmələr/","adj.","Similar to each other.","彼此相似。"),
    W("information","信息","/ˌɪnfərˈmeɪʃn/","n.","Get information.","获取信息。"),
]

g8 = {
    "grade":"初二（八年级）","semester":"全学年（上+下册）","textbook":"人教版 Go for it! (2012审定版)",
    "units":[
        {"unit":1,"title":"Unit 1 Where did you go on vacation?","words":g8u1},
        {"unit":2,"title":"Unit 2 How often do you exercise?","words":g8u2},
        {"unit":3,"title":"Unit 3 I'm more outgoing than my sister.","words":g8u3},
    ]
}
save("grade8.json", g8)

# ============================================================
# 初三 (九年级) 全一册 Unit1-14
# ============================================================
g9u1 = [
    W("textbook","教科书；课本","/ˈtekstbʊk/","n.","Open your textbook.","打开课本。"),
    W("conversation","交谈；谈话","/ˌkɑːnvərˈseɪʃn/","n.","Have a conversation.","进行对话。"),
    W("aloud","大声地","/əˈlaʊd/","adv.","Read aloud.","大声朗读。"),
    W("pronunciation","发音","/prəˌnʌnsiˈeɪʃn/","n.","Good pronunciation.","发音好。"),
    W("sentence","句子","/ˈsentəns/","n.","Make a sentence.","造句。"),
    W("patient","有耐心的；病人","/ˈpeɪʃnt/","adj. & n.","Be patient.","耐心点。"),
    W("expression","表达","/ɪkˈspreʃn/","n.","Facial expression.","面部表情。"),
    W("discover","发现","/dɪˈskʌvər/","v.","Discover the truth.","发现真相。"),
    W("secret","秘密；秘诀","/ˈsiːkrət/","n. & adj.","Keep a secret.","保守秘密。"),
    W("grammar","语法","/ˈɡræmər/","n.","English grammar.","英语语法。"),
    W("repeat","重复","/rɪˈpiːt/","v.","Repeat after me.","跟我读。"),
    W("note","笔记；记录","/noʊt/","n. & v.","Take notes.","记笔记。"),
    W("pal","朋友；伙伴","/pæl/","n.","Pen pal.","笔友。"),
    W("physics","物理","/ˈfɪzɪks/","n.","Physics is hard.","物理很难。"),
    W("chemistry","化学","/ˈkemɪstri/","n.","Chemistry class.","化学课。"),
    W("memorize","记忆","/ˈmeməraɪz/","v.","Memorize words.","记单词。"),
    W("pattern","模式；方式","/ˈpætərn/","n.","Sentence pattern.","句型。"),
    W("pronounce","发音","/prəˈnaʊns/","v.","How to pronounce?","怎么发音？"),
    W("increase","增加；增长","/ɪnˈkriːs/","v.","Increase vocabulary.","增加词汇量。"),
    W("speed","速度","/spiːd/","n.","Reading speed.","阅读速度。"),
    W("partner","搭档；同伴","/ˈpɑːrtnər/","n.","Work with a partner.","与搭档合作。"),
    W("born","出生；天生的","/bɔːrn/","v. & adj.","I was born in 2008.","我生于2008年。"),
    W("ability","能力","/əˈbɪləti/","n.","Learning ability.","学习能力。"),
    W("create","创造","/kriˈeɪt/","v.","Create something new.","创造新事物。"),
    W("brain","大脑","/breɪn/","n.","Use your brain.","动脑子。"),
    W("active","活跃的","/ˈæktɪv/","adj.","Stay active.","保持活跃。"),
    W("attention","注意","/əˈtenʃn/","n.","Pay attention.","注意。"),
    W("connect","连接","/kəˈnekt/","v.","Connect with others.","与他人连接。"),
    W("review","回顾；复习","/rɪˈvjuː/","v. & n.","Review lessons.","复习功课。"),
    W("knowledge","知识","/ˈnɑːlɪdʒ/","n.","Knowledge is power.","知识就是力量。"),
    W("wisely","明智地","/ˈwaɪzli/","adv.","Use time wisely.","明智地使用时间。"),
]
g9u2 = [
    W("mooncake","月饼","/ˈmuːnkeɪk/","n.","Eat mooncakes.","吃月饼。"),
    W("lantern","灯笼","/ˈlæntərn/","n.","Red lanterns.","红灯笼。"),
    W("stranger","陌生人","/ˈstreɪndʒər/","n.","Don't talk to strangers.","别和陌生人说话。"),
    W("relative","亲属","/ˈrelətɪv/","n.","Visit relatives.","走亲戚。"),
    W("pound","磅；英镑","/paʊnd/","n.","Five pounds.","五磅。"),
    W("folk","民间的","/foʊk/","adj.","Folk music.","民间音乐。"),
    W("goddess","女神","/ˈɡɑːdes/","n.","The moon goddess.","月亮女神。"),
    W("steal","偷；窃取","/stiːl/","v.","Steal money.","偷钱。"),
    W("lay","放置；产卵","/leɪ/","v.","Lay eggs.","下蛋。"),
    W("dessert","甜点","/dɪˈzɜːrt/","n.","Have dessert.","吃甜点。"),
    W("garden","花园","/ˈɡɑːrdn/","n.","In the garden.","在花园里。"),
    W("tradition","传统","/trəˈdɪʃn/","n.","Chinese tradition.","中国传统。"),
    W("admire","欣赏；仰慕","/ədˈmaɪər/","v.","I admire you.","我欣赏你。"),
    W("tie","领带；捆","/taɪ/","n. & v.","Wear a tie.","打领带。"),
    W("haunted","闹鬼的","/ˈhɔːntɪd/","adj.","A haunted house.","鬼屋。"),
    W("ghost","鬼","/ɡoʊst/","n.","Ghost story.","鬼故事。"),
    W("trick","花招；把戏","/trɪk/","n.","Play a trick.","搞恶作剧。"),
    W("treat","款待；请客","/triːt/","n. & v.","Trick or treat.","不给糖就捣蛋。"),
    W("spider","蜘蛛","/ˈspaɪdər/","n.","A spider web.","蜘蛛网。"),
    W("Christmas","圣诞节","/ˈkrɪsməs/","n.","Merry Christmas!","圣诞快乐！"),
    W("novel","小说","/ˈnɑːvl/","n.","Read a novel.","读小说。"),
    W("eve","前夕","/iːv/","n.","New Year's Eve.","除夕。"),
    W("dead","死的","/ded/","adj.","Dead leaves.","枯叶。"),
    W("business","生意","/ˈbɪznəs/","n.","Do business.","做生意。"),
    W("punish","处罚","/ˈpʌnɪʃ/","v.","Punish the crime.","惩治犯罪。"),
    W("warn","警告","/wɔːrn/","v.","Warn someone.","警告某人。"),
    W("present","现在；礼物","/ˈpreznt/","n. & adj.","A birthday present.","生日礼物。"),
    W("warmth","温暖","/wɔːrmθ/","n.","The warmth of home.","家的温暖。"),
    W("spread","传播；展开","/spred/","v. & n.","Spread news.","传播消息。"),
]
g9u3 = [
    W("restroom","洗手间","/ˈrestruːm/","n.","Where is the restroom?","洗手间在哪？"),
    W("stamp","邮票","/stæmp/","n.","Buy a stamp.","买邮票。"),
    W("bookstore","书店","/ˈbʊkstɔːr/","n.","At the bookstore.","在书店。"),
    W("beside","在……旁边","/bɪˈsaɪd/","prep.","Beside the river.","在河边。"),
    W("postcard","明信片","/ˈpoʊstkɑːrd/","n.","Send a postcard.","寄明信片。"),
    W("pardon","请再说一遍","/ˈpɑːrdn/","interj.","Pardon me?","请再说一遍？"),
    W("washroom","洗手间","/ˈwɑːʃruːm/","n.","Go to the washroom.","去洗手间。"),
    W("bathroom","浴室","/ˈbæθruːm/","n.","In the bathroom.","在浴室。"),
    W("rush","仓促；急促","/rʌʃ/","v. & n.","Don't rush.","别急。"),
    W("suggest","建议","/səˈdʒest/","v.","I suggest going.","我建议去。"),
    W("staff","职工","/stæf/","n.","Hotel staff.","酒店员工。"),
    W("grape","葡萄","/ɡreɪp/","n.","A bunch of grapes.","一串葡萄。"),
    W("central","中心的","/ˈsentrəl/","adj.","Central Park.","中央公园。"),
    W("nearby","在附近","/ˌnɪrˈbaɪ/","adv. & adj.","A nearby shop.","附近的商店。"),
    W("mail","邮寄；邮件","/meɪl/","v. & n.","Send an e-mail.","发邮件。"),
    W("east","东方","/iːst/","adj. & n.","In the east.","在东方。"),
    W("fascinating","迷人的","/ˈfæsɪneɪtɪŋ/","adj.","A fascinating story.","迷人的故事。"),
    W("convenient","方便的","/kənˈviːniənt/","adj.","Very convenient.","很方便。"),
    W("corner","拐角","/ˈkɔːrnər/","n.","On the corner.","在拐角处。"),
    W("politely","礼貌地","/pəˈlaɪtli/","adv.","Ask politely.","礼貌地询问。"),
    W("request","要求；请求","/rɪˈkwest/","n. & v.","Make a request.","提出请求。"),
    W("direction","方向","/dəˈrekʃn/","n.","Which direction?","哪个方向？"),
    W("correct","正确的","/kəˈrekt/","adj.","Correct answer.","正确答案。"),
    W("polite","有礼貌的","/pəˈlaɪt/","adj.","Be polite.","要有礼貌。"),
    W("direct","直接的","/dəˈrekt/","adj.","A direct flight.","直飞航班。"),
    W("address","地址","/əˈdres/","n.","What's your address?","你的地址是什么？"),
    W("underground","地下的","/ˈʌndərɡraʊnd/","adj.","Underground station.","地铁站。"),
    W("course","课程","/kɔːrs/","n.","Of course.","当然。"),
]
g9u4 = [
    W("humorous","有幽默感的","/ˈhjuːmərəs/","adj.","A humorous person.","幽默的人。"),
    W("silent","沉默的","/ˈsaɪlənt/","adj.","Keep silent.","保持沉默。"),
    W("helpful","有帮助的","/ˈhelpfl/","adj.","Very helpful.","很有帮助。"),
    W("score","得分","/skɔːr/","n. & v.","A high score.","高分。"),
    W("background","背景","/ˈbækɡraʊnd/","n.","Family background.","家庭背景。"),
    W("interview","采访；面试","/ˈɪntərvjuː/","v. & n.","Job interview.","工作面试。"),
    W("Asian","亚洲的；亚洲人","/ˈeɪʒn/","adj. & n.","Asian countries.","亚洲国家。"),
    W("deal","对付；对待","/diːl/","v.","Deal with it.","处理它。"),
    W("dare","敢于","/der/","v.","Dare to try.","敢于尝试。"),
    W("crowd","人群","/kraʊd/","n.","A big crowd.","一大群人。"),
    W("private","私人的","/ˈpraɪvət/","adj.","Private life.","私生活。"),
    W("guard","警卫；守卫","/ɡɑːrd/","n. & v.","Security guard.","保安。"),
    W("require","需要","/rɪˈkwaɪər/","v.","It requires effort.","需要努力。"),
    W("European","欧洲的","/ˌjʊrəˈpiːən/","adj.","European countries.","欧洲国家。"),
    W("speech","讲话；发言","/spiːtʃ/","n.","Give a speech.","发表演讲。"),
    W("public","公众的","/ˈpʌblɪk/","n. & adj.","In public.","在公共场合。"),
    W("seldom","很少","/ˈseldəm/","adv.","I seldom go there.","我很少去。"),
    W("influence","影响","/ˈɪnfluəns/","n. & v.","Have an influence.","有影响。"),
    W("absent","缺席","/ˈæbsənt/","adj.","Absent from school.","缺课。"),
    W("fail","失败","/feɪl/","v.","Fail the exam.","考试不及格。"),
    W("examination","考试","/ɪɡˌzæmɪˈneɪʃn/","n.","Take an examination.","参加考试。"),
    W("exactly","确切地","/ɪɡˈzæktli/","adv.","Exactly right.","完全正确。"),
    W("pride","自豪","/praɪd/","n.","Take pride in.","以……为荣。"),
    W("proud","自豪的","/praʊd/","adj.","I'm proud of you.","我为你骄傲。"),
    W("general","总的；普遍的","/ˈdʒenrəl/","adj.","In general.","一般来说。"),
    W("introduction","介绍","/ˌɪntrəˈdʌkʃn/","n.","Self-introduction.","自我介绍。"),
]
g9u5 = [
    W("chopsticks","筷子","/ˈtʃɑːpstɪks/","n.","Use chopsticks.","用筷子。"),
    W("coin","硬币","/kɔɪn/","n.","A gold coin.","金币。"),
    W("fork","餐叉","/fɔːrk/","n.","Knife and fork.","刀叉。"),
    W("blouse","女式短上衣","/blaʊz/","n.","A white blouse.","白色短上衣。"),
    W("silver","银；银色的","/ˈsɪlvər/","n. & adj.","Silver medal.","银牌。"),
    W("glass","玻璃","/ɡlæs/","n.","A glass window.","玻璃窗。"),
    W("cotton","棉；棉花","/ˈkɑːtn/","n.","Cotton clothes.","棉衣。"),
    W("steel","钢","/stiːl/","n.","Steel bridge.","钢桥。"),
    W("fair","展览会；公平的","/fer/","n. & adj.","Trade fair.","商品交易会。"),
    W("environmental","环境的","/ɪnˌvaɪrənˈmentl/","adj.","Environmental protection.","环境保护。"),
    W("grass","草","/ɡræs/","n.","Green grass.","绿草。"),
    W("leaf","叶子","/liːf/","n.","Green leaves.","绿叶。"),
    W("produce","生产","/prəˈduːs/","v.","Produce goods.","生产商品。"),
    W("widely","广泛地","/ˈwaɪdli/","adv.","Widely used.","广泛使用。"),
    W("process","加工；过程","/ˈprɑːses/","v. & n.","Processing food.","加工食品。"),
    W("pack","包装","/pæk/","v.","Pack up.","打包。"),
    W("product","产品","/ˈprɑːdʌkt/","n.","New product.","新产品。"),
    W("local","当地的","/ˈloʊkl/","adj.","Local food.","当地美食。"),
    W("brand","品牌","/brænd/","n.","A famous brand.","著名品牌。"),
    W("avoid","避免","/əˈvɔɪd/","v.","Avoid mistakes.","避免错误。"),
    W("mobile","可移动的","/ˈmoʊbl/","adj.","Mobile phone.","手机。"),
    W("everyday","日常的","/ˈevrideɪ/","adj.","Everyday life.","日常生活。"),
    W("boss","老板","/bɔːs/","n.","My boss.","我的老板。"),
    W("Germany","德国","/ˈdʒɜːrməni/","n.","Made in Germany.","德国制造。"),
    W("material","材料","/məˈtɪriəl/","n.","Building materials.","建筑材料。"),
    W("traffic","交通","/ˈtræfɪk/","n.","Traffic jam.","交通堵塞。"),
    W("international","国际的","/ˌɪntərˈnæʃnəl/","adj.","International trade.","国际贸易。"),
    W("form","形式","/fɔːrm/","n.","In the form of.","以……形式。"),
    W("lively","生气勃勃的","/ˈlaɪvli/","adj.","A lively city.","生机勃勃的城市。"),
    W("heat","热；高温","/hiːt/","n. & v.","Summer heat.","夏天的炎热。"),
    W("complete","完成","/kəmˈpliːt/","v.","Complete the task.","完成任务。"),
]

g9 = {
    "grade":"初三（九年级）","semester":"全一册","textbook":"人教版 Go for it! (2012审定版)",
    "units":[
        {"unit":1,"title":"Unit 1 How can we become good learners?","words":g9u1},
        {"unit":2,"title":"Unit 2 I think that mooncakes are delicious!","words":g9u2},
        {"unit":3,"title":"Unit 3 Could you please tell me where the restrooms are?","words":g9u3},
        {"unit":4,"title":"Unit 4 I used to be afraid of the dark.","words":g9u4},
        {"unit":5,"title":"Unit 5 What are the shirts made of?","words":g9u5},
    ]
}
save("grade9.json", g9)

print("\nDone! Generated all grade files.")
