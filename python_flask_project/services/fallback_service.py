"""
Local Fallback Generation Service for Meme and Humor Idea Generator.
Provides intelligent, template-driven humor generation when Google Gemini API
is offline, unconfigured, or quota-limited. Ensures 100% application uptime.
"""

import random
from typing import List, Dict, Any

# College, Tech, and Relatable Meme Patterns
TOPIC_TEMPLATES = {
  "college": {
    "visuals": [
      "Student staring blankly at Question 1 while whole hall is vigorously asking for extra sheets",
      "Friend saying 'Machan don't study da, fail aavom' and scoring 95%",
      "Alarm ringing at 7:45 AM for an 8:00 AM 75% mandatory attendance lab session",
      "Submitting assignment at 11:59:58 PM with heart rate at 180 BPM",
      "Group project meeting where 1 person works and 3 people provide emotional support"
    ],
    "top_bottom": [
      ("Syllabus before semester starts: Easy peasy", "Syllabus night before semester exam: War and Peace Part 2"),
      ("Me promising to wake up at 5 AM to study", "Me waking up at 8:30 AM to calculate attendance percentage"),
      ("Professor: 'This will not be asked in exams'", "First question on Question Paper: 15 Marks"),
      ("My brain during 4 months of lectures: 404 Not Found", "My brain 10 minutes before the exam: Quantum physics unlocked"),
      ("Group project: 4 members registered", "Group project: 1 committer, 3 cheerleaders")
    ]
  },
  "programming": {
    "visuals": [
      "Junior developer pushing to main branch on Friday 4:59 PM",
      "Fixing 1 bug in code and spawning 27 brand new unexpected errors",
      "StackOverflow tab open with code from 2011 copy-pasted without understanding",
      "Docker container running fine on local machine while production server collapses",
      "CSS center a div attempting 14 different flexbox and grid combinations"
    ],
    "top_bottom": [
      ("It works on my machine", "Then we will ship your machine to the client"),
      ("Code comments: // Temporary fix do not touch", "Last modified: 8 years ago"),
      ("Me spending 4 hours debugging", "The culprit: One missing semicolon or rogue space"),
      ("Client: 'Just one small, simple change'", "The backend architecture: Crumbles into dust"),
      ("AI writing the code in 5 seconds", "Me spending 5 hours understanding what the AI just wrote")
    ]
  },
  "general": {
    "visuals": [
      "Opening refrigerator for the 5th time in 10 minutes hoping new food spawned",
      "Saying 'You too' when the cinema staff says 'Enjoy your movie'",
      "Putting phone on charge and checking after 1 hour only to see switch was OFF",
      "Saying 'I am 5 minutes away' while still searching for matching socks at home",
      "Ordering a healthy salad and eating a double cheese pizza 2 hours later"
    ],
    "top_bottom": [
      ("My plans for productive Sunday", "Bed and YouTube autoplay till 4 PM"),
      ("Me in shower winning hypothetical arguments", "Me in real life: 'Sorry for existing'"),
      ("Bank account balance on the 1st of month", "Bank account balance on the 7th of month"),
      ("Brain at 11:00 PM: Sleep mode initiated", "Brain at 2:30 AM: Why do we never see baby pigeons?"),
      ("Me: 'I will just watch 1 YouTube video'", "Next morning 3:00 AM: How ancient Rome built aqueducts")
    ]
  }
}

# Tanglish (Tamil-English) Humor Presets
TANGLISH_TEMPLATES = [
  {
    "title": "Semester Exam Thillalangadi",
    "concept": "Friend saying exam will be super tough, then ending up as college topper.",
    "visual_scene": "Friend acting innocent with blank face while teacher announces their 9.8 CGPA.",
    "top_text": "Exam hall-la friend: 'Machi onnumey padikkala da!'",
    "bottom_text": "Result sheet-la avan marks: 98 out of 100",
    "caption": "Intha maathiri friends-a nambi thaan naan fail aaguren! #TanglishHumor #CollegeLife",
    "hashtags": ["#TanglishMemes", "#MachiFailAaitom", "#CollegeDiaries", "#VeraLevel"]
  },
  {
    "title": "Attendance Percentage Beedi",
    "concept": "Calculating attendance decimal points before semester condonation.",
    "visual_scene": "Student using scientific calculator with NASA precision to calculate if 74.8% rounds up to 75%.",
    "top_text": "HOD: 75% attendance illanna hall ticket kedaikaathu!",
    "bottom_text": "Me with 74.9%: 'Sir, maths-la round-off panna 75% thaane?'",
    "caption": "Maths talent exam-la varaadhu, aana attendance calculate pannumpothu automatic-ah varum! ",
    "hashtags": ["#AttendanceProblem", "#EngineeringLife", "#TanglishComedy", "#CollegeHumor"]
  },
  {
    "title": "Monday Morning Hostel Shock",
    "concept": "Hostel mess sambar mystery and Monday morning classes.",
    "visual_scene": "Hostel mess warden pouring mysterious yellow liquid with pure confidence.",
    "top_text": "Sunday night: 'Naalaikku gym poi, full syllabus cover panni topper aaganum'",
    "bottom_text": "Monday 8:15 AM: 5 minutes thungittu odalam nu alarm snooze panniyachu",
    "caption": "Enna da idhu vazhkai... Monday vanthaale energy 0% aayidum! ‍️",
    "hashtags": ["#HostelMemes", "#TanglishVibes", "#MondayBlues", "#EnnaKodumaSirIdhu"]
  },
  {
    "title": "Coding Bug Sothanai",
    "concept": "Developer spending whole day fixing error caused by spelling mistake.",
    "visual_scene": "Coder staring at red error trace on terminal at 2 AM with chai cup in hand.",
    "top_text": "Client: 'Project eppo deploy aagum?'",
    "bottom_text": "Me: 'Code run aana thaane theriyum bro!'",
    "caption": "Local machine-la work aachu boss, cloud-la enna aachu nu therila! ",
    "hashtags": ["#ProgrammerTanglish", "#BugFixing", "#DeveloperLife", "#SemmaSodhanai"]
  },
  {
    "title": "Salary Day vs Month End",
    "concept": "Living like a king for 3 days and surviving on instant noodles for the remaining 27 days.",
    "visual_scene": "First week eating biryani in fine dining, last week negotiating prices for cutting chai.",
    "top_text": "Day 1 of the month: 'GPay panni vidra machi, naan paathukuren!'",
    "bottom_text": "Day 25 of the month: 'Dei yaravadhu 50 rupees GPay panna mudiyuma?'",
    "caption": "Account balance nethu paatha maathiri irundhuchu, innaikku engey poiduchi? ",
    "hashtags": ["#MonthEndStruggles", "#SalaryMemes", "#TanglishComedy", "#PaisaPochu"]
  }
]

# Tamil Script Humor Presets
TAMIL_TEMPLATES = [
  {
    "title": "தேர்வு நாள் அமர்க்களம்",
    "concept": "இரவு முழுவதும் விழித்திருந்து படித்துவிட்டு தேர்வில் தூங்குவது.",
    "visual_scene": "தேர்வு அறையில் கேள்வித்தாளை தலைகீழாகப் பார்த்து முழிக்கும் மாணவன்.",
    "top_text": "இரவு 3 மணி வரை படித்த மூளை",
    "bottom_text": "காலை 9:30 மணிக்கு தேர்வு ஹாலில்: 'நான் யாரு? இங்க ஏன் வந்தேன்?'",
    "caption": "படிச்சது ஒன்னு, வந்தது ஒன்னு, எழுதுனது வேற ஒன்னு! ",
    "hashtags": ["#தமிழ்மீம்ஸ்", "#கல்லூரிவாழ்க்கை", "#தேர்வுநகைச்சுவை", "#செமமீம்"]
  },
  {
    "title": "நண்பனின் பொய் வாக்குறுதி",
    "concept": "ஒன்றாகப் படித்து பெயில் ஆவோம் என்று கூறிவிட்டு முதல் மதிப்பெண் வாங்கும் நண்பன்.",
    "visual_scene": "கண்ணீருடன் நண்பனைப் பார்க்கும் வடிவேலு பாணி காட்சி.",
    "top_text": "நண்பன்: 'மச்சி ஒண்ணுமே படிக்கல, ரெண்டு பேரும் ஒன்னா பெயில் ஆவோம்!'",
    "bottom_text": "மதிப்பெண் பட்டியல் வந்ததும்: நண்பன் காலேஜ் டாப்பர்!",
    "caption": "இப்படிப்பட்ட நண்பர்கள் இருக்கும்போது எதிரிகள் எதற்கு? ‍️",
    "hashtags": ["#நண்பன்மீம்ஸ்", "#தமிழ்ஹியூமர்", "#வடிவேலுமீம்ஸ்", "#காலேஜ்காமெடி"]
  },
  {
    "title": "திங்கள் கிழமை அலாரம்",
    "concept": "ஞாயிறு இரவு போட்ட சபதம் திங்கள் காலை காற்றில் பறப்பது.",
    "visual_scene": "அலாரத்தை அடித்து நொறுக்கும் சோம்பேறி மனிதன்.",
    "top_text": "ஞாயிறு இரவு: 'நாளை முதல் புதிய வாழ்க்கை ஆரம்பம்!'",
    "bottom_text": "திங்கள் காலை 7 மணி: 'இன்னைக்கு ஒரு நாள் லீவு போட்டுறலாமா?'",
    "caption": "ஒவ்வொரு வாரமும் இதே கதை தான்... மாற்றம் ஒன்றே மாறாதது! ",
    "hashtags": ["#திங்கள்கிழமை", "#சோம்பேறிவாழ்க்கை", "#தமிழ்மீம்", "#மீம்கள்"]
  },
  {
    "title": "மென்பொருள் பிழை சோதனைகள்",
    "concept": "ஒரு செமிகோலன் விட்டுவிட்டு 5 மணி நேரம் தலையைப் பிய்த்துக் கொள்ளும் புரோகிராமர்.",
    "visual_scene": "மானிட்டர் முன் மயங்கி விழுந்த மென்பொருள் பொறியாளர்.",
    "top_text": "கோடிங் எழுதியது 10 நிமிடம்",
    "bottom_text": "பிழை திருத்தியது 10 மணி நேரம்!",
    "caption": "என் கணினியில் வேலை செய்தது சார், சர்வரில் என்னாச்சோ தெரியல! ",
    "hashtags": ["#புரோகிராமர்", "#தமிழ்ஐடி", "#கோடிங்சோதனை", "#டெக்மீம்ஸ்"]
  },
  {
    "title": "மாத இறுதி சவால்",
    "concept": "மாத ஆரம்பத்தில் பிரியாணி, மாத இறுதியில் ஊறுகாய் சாதம்.",
    "visual_scene": "காலியான பர்ஸைப் பார்த்து ஆச்சரியப்படும் இளைஞன்.",
    "top_text": "மாதத்தின் 1ஆம் தேதி: 'பில் என்னவோ நான் போடுறேன்!'",
    "bottom_text": "மாதத்தின் 25ஆம் தேதி: 'மச்சி 10 ரூபாய் இருந்தா குடேன்!'",
    "caption": "பணம் எப்படி போகுதுனே தெரிய மாட்டேங்குது! ",
    "hashtags": ["#மாதஇறுதி", "#பணக்கஷ்டம்", "#தமிழ்நகைச்சுவை", "#சிரிப்பு"]
  }
]


def generate_fallback_ideas(
  topic: str,
  category: str = "Relatable Humor",
  style: str = "Witty",
  intensity: str = "Medium",
  language: str = "English",
  count: int = 5
) -> List[Dict[str, Any]]:
  """Generates structured meme idea cards using local fallback templates."""
  clean_topic = topic.strip() if topic else "Daily Life"
  topic_lower = clean_topic.lower()
  
  # Check language preference first
  if language.lower() == "tamil":
    ideas = list(TAMIL_TEMPLATES)
    random.shuffle(ideas)
    return ideas[:count]
  elif language.lower() == "tanglish":
    ideas = list(TANGLISH_TEMPLATES)
    random.shuffle(ideas)
    return ideas[:count]

  # Select base category domain
  domain = "general"
  if any(k in topic_lower for k in ["code", "program", "developer", "bug", "python", "software", "tech", "ai", "git"]):
    domain = "programming"
  elif any(k in topic_lower for k in ["college", "exam", "student", "study", "hostel", "semester", "attendance", "assignment"]):
    domain = "college"

  templates = TOPIC_TEMPLATES.get(domain, TOPIC_TEMPLATES["general"])
  visuals = templates["visuals"]
  top_bottoms = templates["top_bottom"]

  results = []
  titles = [
    f"The {clean_topic} Paradox",
    f"Expectation vs Reality: {clean_topic}",
    f"Survival Guide to {clean_topic}",
    f"The 2 AM {clean_topic} Epiphany",
    f"Nobody Asked for This: {clean_topic}",
    f"{clean_topic} in a Nutshell",
    f"The Unspoken Rule of {clean_topic}"
  ]
  random.shuffle(titles)

  captions = [
    f"Why is this {clean_topic} situation attacking me personally at this hour?",
    f"If you've ever dealt with {clean_topic}, you know this exact dread.",
    f"My therapist told me to stop stressing about {clean_topic}, so I made a meme.",
    f"Tag that one friend who exemplifies this {clean_topic} energy completely.",
    f"10/10 would choose sleep over dealing with {clean_topic} again."
  ]
  random.shuffle(captions)

  for i in range(min(count, len(top_bottoms))):
    tb = top_bottoms[i % len(top_bottoms)]
    vis = visuals[i % len(visuals)]
    title = titles[i % len(titles)]
    cap = captions[i % len(captions)]

    results.append({
      "title": title,
      "concept": f"A hilarious contrast highlighting how {clean_topic} feels compared to what was expected in {category} style.",
      "visual_scene": f"{vis} with dramatic meme lighting.",
      "top_text": tb[0],
      "bottom_text": tb[1],
      "caption": cap,
      "hashtags": [
        f"#{clean_topic.replace(' ', '')}",
        f"#{category.replace(' ', '')}",
        "#MemeEconomy",
        "#RelatableHumor",
        "#TooReal"
      ]
    })

  return results


def generate_fallback_captions(
  topic: str,
  tone: str = "Witty",
  language: str = "English",
  count: int = 5
) -> List[Dict[str, str]]:
  """Generates social media captions in fallback mode."""
  clean_topic = topic.strip() if topic else "Life"

  if language.lower() == "tanglish":
    tanglish_caps = [
      f"{clean_topic} pathi pesinaale tears automatic-ah varum bro! #Tanglish",
      f"Vera level timing! {clean_topic} irundha life set aagidum nu sonnanga! #MachiVibe",
      f"Enna da idhu pudhu sodhanai? {clean_topic} mudikka mudiyama thala valikkudhu! ‍️",
      f"Full confidence-oda vandhen, {clean_topic} paathadhum silence aayiten! ",
      f"Pesaama oru chai kudichittu {clean_topic} continue pannuvom machan! "
    ]
    return [{"caption": c, "tone": tone, "platform": "Instagram / Twitter"} for c in tanglish_caps[:count]]

  if language.lower() == "tamil":
    tamil_caps = [
      f"{clean_topic} பற்றி பேசினா சிரிப்பு கூடவே அழுகையும் வருது! #தமிழ்",
      f"நினைச்சது ஒன்னு, நடந்தது {clean_topic}! செம மொமண்ட்! ",
      f"வாழ்க்கையில் எல்லாம் மாறும், ஆனா இந்த {clean_topic} மட்டும் மாறாது! ‍️",
      f"ஒரு டீயை குடிச்சிட்டு {clean_topic} சமாளிப்போம் நண்பா! ",
      f"இதுக்கு மேல விளக்கம் தேவையில்லை... காட்சி பேசும்! "
    ]
    return [{"caption": c, "tone": tone, "platform": "Instagram / Threads"} for c in tamil_caps[:count]]

  english_caps = [
    f"Me pretending {clean_topic} doesn't affect my sleep schedule at 3 AM. ",
    f"If {clean_topic} was an Olympic sport, I’d take home the gold in overthinking. ",
    f"Not me trying to romanticize {clean_topic} with an iced coffee. ",
    f"Live, laugh, and question every life decision that led to this {clean_topic}. ",
    f"Professional in the streets, utterly overwhelmed by {clean_topic} in the sheets.",
    f"Currently accepting emotional support snacks for dealing with {clean_topic}. ",
    f"Some people have hobbies. My hobby is stressing over {clean_topic}."
  ]
  random.shuffle(english_caps)
  return [{"caption": c, "tone": tone, "platform": "Social Media"} for c in english_caps[:count]]


def generate_fallback_jokes(
  category: str = "College and Student Humor",
  style: str = "Witty",
  language: str = "English",
  count: int = 5
) -> List[Dict[str, Any]]:
  """Generates jokes in fallback mode."""
  if language.lower() == "tanglish":
    tanglish_jokes = [
      {
        "type": "Q&A",
        "setup": "Hostel mess-la chicken biryani-kum sambar rice-kum enna difference?",
        "punchline": "Biryani-la oru tiny bone irukkum, sambar-la athuvum irukkaadhu!",
        "tags": ["Hostel", "College", "Food"]
      },
      {
        "type": "One-liner",
        "setup": "Engineering padichu enna aachu nu ketaanga...",
        "punchline": "Sleep cycle pochudhu, aana Google search skills NASA level-ku poiruchi!",
        "tags": ["Engineering", "Students"]
      },
      {
        "type": "Situational",
        "setup": "Invigilator: 'Why are you copying from your friend?'",
        "punchline": "Student: 'Sharing is caring nu primary school-la neengathaane sir solli thantheenga!'",
        "tags": ["Exam", "College"]
      },
      {
        "type": "Programming",
        "setup": "A programmer's girlfriend says: 'Go to the store and buy a loaf of bread. If they have eggs, buy a dozen.'",
        "punchline": "He returns with 12 loaves of bread because they had eggs.",
        "tags": ["Dev", "Logic"]
      },
      {
        "type": "Puns",
        "setup": "WiFi router-kum college degree-kum enna similarity?",
        "punchline": "Rendume disconnection aana dhaan reality theriyum!",
        "tags": ["Tech", "College"]
      }
    ]
    return tanglish_jokes[:count]

  jokes = [
    {
      "type": "Q&A",
      "setup": "Why do programmers prefer dark mode?",
      "punchline": "Because light attracts bugs!",
      "tags": ["Programming", "Tech", "Classic"]
    },
    {
      "type": "One-liner",
      "setup": "My degree taught me that sleep is a myth created by mattress companies.",
      "punchline": "Now back to my 4th cup of instant coffee.",
      "tags": ["College", "Relatable"]
    },
    {
      "type": "Programming",
      "setup": "There are 10 types of people in the world:",
      "punchline": "Those who understand binary, and those who don't.",
      "tags": ["Developer", "Nerd"]
    },
    {
      "type": "College",
      "setup": "Student: 'Can I write this exam with blue or black ink?'",
      "punchline": "Professor: 'Write it with your tears if you want, just don't leave it blank.'",
      "tags": ["Exam", "College"]
    },
    {
      "type": "Puns",
      "setup": "Why was the math book always crying?",
      "punchline": "Because it had too many problems of its own.",
      "tags": ["Math", "Pun"]
    },
    {
      "type": "Situational",
      "setup": "I told my doctor I get panic attacks when someone knocks on my door.",
      "punchline": "He told me to stop ordering food delivery from three different apps simultaneously.",
      "tags": ["Life", "Relatable"]
    },
    {
      "type": "One-liner",
      "setup": "Debugging is like being the detective in a crime movie where you are also the murderer.",
      "punchline": "And you left fingerprints on every line of code.",
      "tags": ["Dev", "Humor"]
    }
  ]
  random.shuffle(jokes)
  return jokes[:count]
