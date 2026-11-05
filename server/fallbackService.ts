export interface MemeIdea {
  title: string;
  concept: string;
  visual_scene: string;
  top_text: string;
  bottom_text: string;
  caption: string;
  hashtags: string[];
}

export interface CaptionItem {
  caption: string;
  tone: string;
  platform: string;
}

export interface JokeItem {
  type: string;
  setup: string;
  punchline: string;
  tags: string[];
}

const TOPIC_TEMPLATES = {
  college: {
    visuals: [
      "Student staring blankly at Question 1 while the entire hall is aggressively asking for supplementary sheets",
      "Friend whispering 'Machi I did not study at all' and scoring 98/100 on the exam",
      "Alarm buzzing relentlessly at 7:45 AM for an 8:00 AM mandatory 75% attendance lab session",
      "Submitting an engineering assignment at 11:59:58 PM with adrenaline at peak levels",
      "Group project meeting where 1 person codes everything and 3 people offer moral support"
    ],
    top_bottom: [
      ["Syllabus before semester begins: Looks manageable", "Syllabus night before the exam: Quantum War & Peace"],
      ["Me promising to wake up at 5:00 AM to study", "Me waking up at 8:40 AM calculating attendance percentages"],
      ["Professor: 'This section will not appear on the paper'", "Question 1 on exam: 20 Marks compulsory"],
      ["My brain during 4 months of lectures: 404 Not Found", "My brain 10 minutes before the bell: Sudden enlightenment"],
      ["Group project: 4 team members registered", "Group project: 1 committer, 3 enthusiastic cheerleaders"]
    ]
  },
  programming: {
    visuals: [
      "Junior developer pushing directly to the main branch on Friday at 4:59 PM",
      "Fixing 1 tiny bug in code and triggering 32 brand new compiler tantrums",
      "StackOverflow tab open with an answer from 2011 copy-pasted with blind faith",
      "Docker container running peacefully on localhost while production server catches fire",
      "Attempting to center a div using every flexbox and grid combination in human history"
    ],
    top_bottom: [
      ["'It works flawlessly on my machine'", "Then we will pack your laptop and ship it to the client"],
      ["Code comments: // Temporary fix do not touch", "Last modified: 9 years ago by an intern"],
      ["Me spending 5 hours agonizing over a memory leak", "The culprit: One missing semicolon or rogue space"],
      ["Client: 'Just one microscopic design tweak'", "The entire microservices backend: Crumbles instantly"],
      ["AI writing complete code in 3 seconds", "Me spending 6 hours debugging what the AI actually produced"]
    ]
  },
  general: {
    visuals: [
      "Opening the refrigerator for the 5th time in 10 minutes hoping new gourmet snacks spawned",
      "Saying 'You too!' immediately after the airport security guard says 'Have a safe flight'",
      "Plugging phone in to charge and coming back an hour later only to find switch was OFF",
      "Texting 'I am 2 minutes away' while currently standing in a towel searching for socks",
      "Ordering an organic salad for dinner and ordering a family pizza at 1:30 AM"
    ],
    top_bottom: [
      ["My ambitions for a productive Sunday", "Lying in bed watching documentary about ancient bread until 5 PM"],
      ["Me in the shower winning complex geopolitical arguments", "Me in real life: 'Sorry for existing, please go ahead'"],
      ["Account balance on the 1st of the month", "Account balance on the 8th of the month after ordering takeout"],
      ["Brain at 10:30 PM: Time to sleep peacefully", "Brain at 2:45 AM: Why do we never see baby pigeons anywhere?"],
      ["Me: 'I will watch just one 5-minute tutorial'", "Clock at 3:15 AM: How ancient Aztecs built irrigation canals"]
    ]
  }
};

const TANGLISH_TEMPLATES: MemeIdea[] = [
  {
    title: "Semester Exam Thillalangadi",
    concept: "Friend crying that they are going to fail, then ending up as department topper.",
    visual_scene: "Friend maintaining innocent face while professor announces their 9.8 CGPA to the entire class.",
    top_text: "Exam hall-la friend: 'Machi onnumey therila da, fail aavom!'",
    bottom_text: "Result sheet-la avan score: 98 out of 100",
    caption: "Intha maathiri friends-a nambi thaan naan fail aaguren! #TanglishHumor #CollegeLife",
    hashtags: ["#TanglishMemes", "#MachiFailAaitom", "#CollegeDiaries", "#VeraLevel"]
  },
  {
    title: "Attendance Percentage Beedi",
    concept: "Calculating attendance decimal points with scientific precision to get hall ticket.",
    visual_scene: "Engineering student using scientific calculator to see if 74.8% rounds up to 75%.",
    top_text: "HOD: 75% attendance illanna hall ticket kedaikaathu!",
    bottom_text: "Me with 74.9%: 'Sir, maths-la round-off panna 75% thaane?'",
    caption: "Maths talent exam-la varaadhu, aana attendance calculate pannumpothu automatic-ah varum!",
    hashtags: ["#AttendanceProblem", "#EngineeringLife", "#TanglishComedy", "#CollegeHumor"]
  },
  {
    title: "Monday Morning Hostel Shock",
    concept: "Hostel mess mysterious sambar recipe and surviving Monday 8 AM class.",
    visual_scene: "Hostel mess warden serving yellow liquid with supreme chef confidence.",
    top_text: "Sunday night: 'Naalaikku gym poi, full syllabus cover pannanum'",
    bottom_text: "Monday 8:15 AM: 5 minutes thungittu odalam nu alarm snooze panniyachu",
    caption: "Enna da idhu vazhkai... Monday vanthaale energy 0% aayidum!",
    hashtags: ["#HostelMemes", "#TanglishVibes", "#MondayBlues", "#EnnaKodumaSirIdhu"]
  },
  {
    title: "Coding Bug Sothanai",
    concept: "Developer spending entire day fixing a bug caused by a spelling mistake.",
    visual_scene: "Coder staring with bloodshot eyes at terminal at 2 AM with cutting chai.",
    top_text: "Client: 'Project eppo deploy aagum bro?'",
    bottom_text: "Me: 'Localhost-la work aana thaane cloud-ku vara mudiyum!'",
    caption: "Local machine-la work aachu boss, server-la enna aachu nu aandaravanukke therila!",
    hashtags: ["#ProgrammerTanglish", "#BugFixing", "#DeveloperLife", "#SemmaSodhanai"]
  },
  {
    title: "Salary Day vs Month End",
    concept: "Living like a king on Day 1 and calculating pennies for tea on Day 25.",
    visual_scene: "First week eating biryani at luxury hotel, last week searching sofa cushions for coins.",
    top_text: "Day 1 of the month: 'GPay panni vidra machi, naan paathukuren!'",
    bottom_text: "Day 25 of the month: 'Dei yaravadhu 50 rupees GPay panna mudiyuma please?'",
    caption: "Account balance nethu paatha maathiri irundhuchu, innaikku engey poiduchi?",
    hashtags: ["#MonthEndStruggles", "#SalaryMemes", "#TanglishComedy", "#PaisaPochu"]
  }
];

const TAMIL_TEMPLATES: MemeIdea[] = [
  {
    title: "தேர்வு நாள் அமர்க்களம்",
    concept: "இரவு முழுவதும் விழித்திருந்து படித்துவிட்டு தேர்வில் தூங்குவது.",
    visual_scene: "தேர்வு அறையில் கேள்வித்தாளை தலைகீழாகப் பார்த்து முழிக்கும் மாணவன்.",
    top_text: "இரவு 3 மணி வரை படித்த மூளை",
    bottom_text: "காலை 9:30 மணிக்கு தேர்வு ஹாலில்: 'நான் யாரு? இங்க ஏன் வந்தேன்?'",
    caption: "படிச்சது ஒன்னு, வந்தது ஒன்னு, எழுதுனது வேற ஒன்னு!",
    hashtags: ["#தமிழ்மீம்ஸ்", "#கல்லூரிவாழ்க்கை", "#தேர்வுநகைச்சுவை", "#செமமீம்"]
  },
  {
    title: "நண்பனின் பொய் வாக்குறுதி",
    concept: "ஒன்றாகப் படித்து பெயில் ஆவோம் என்று கூறிவிட்டு முதல் மதிப்பெண் வாங்கும் நண்பன்.",
    visual_scene: "கண்ணீருடன் நண்பனைப் பார்க்கும் வடிவேலு பாணி காட்சி.",
    top_text: "நண்பன்: 'மச்சி ஒண்ணுமே படிக்கல, ரெண்டு பேரும் ஒன்னா பெயில் ஆவோம்!'",
    bottom_text: "மதிப்பெண் பட்டியல் வந்ததும்: நண்பன் காலேஜ் டாப்பர்!",
    caption: "இப்படிப்பட்ட நண்பர்கள் இருக்கும்போது எதிரிகள் எதற்கு?",
    hashtags: ["#நண்பன்மீம்ஸ்", "#தமிழ்ஹியூமர்", "#வடிவேலுமீம்ஸ்", "#காலேஜ்காமெடி"]
  },
  {
    title: "திங்கள் கிழமை அலாரம்",
    concept: "ஞாயிறு இரவு போட்ட சபதம் திங்கள் காலை காற்றில் பறப்பது.",
    visual_scene: "அலாரத்தை அடித்து நொறுக்கும் சோம்பேறி மனிதன்.",
    top_text: "ஞாயிறு இரவு: 'நாளை முதல் புதிய வாழ்க்கை ஆரம்பம்!'",
    bottom_text: "திங்கள் காலை 7 மணி: 'இன்னைக்கு ஒரு நாள் லீவு போட்டுறலாமா?'",
    caption: "ஒவ்வொரு வாரமும் இதே கதை தான்... மாற்றம் ஒன்றே மாறாதது!",
    hashtags: ["#திங்கள்கிழமை", "#சோம்பேறிவாழ்க்கை", "#தமிழ்மீம்", "#மீம்கள்"]
  },
  {
    title: "மென்பொருள் பிழை சோதனைகள்",
    concept: "ஒரு செமிகோலன் விட்டுவிட்டு 5 மணி நேரம் தலையைப் பிய்த்துக் கொள்ளும் புரோகிராமர்.",
    visual_scene: "மானிட்டர் முன் மயங்கி விழுந்த மென்பொருள் பொறியாளர்.",
    top_text: "கோடிங் எழுதியது 10 நிமிடம்",
    bottom_text: "பிழை திருத்தியது 10 மணி நேரம்!",
    caption: "என் கணினியில் வேலை செய்தது சார், சர்வரில் என்னாச்சோ தெரியல!",
    hashtags: ["#புரோகிராமர்", "#தமிழ்ஐடி", "#கோடிங்சோதனை", "#டெக்மீம்ஸ்"]
  },
  {
    title: "மாத இறுதி சவால்",
    concept: "மாத ஆரம்பத்தில் பிரியாணி, மாத இறுதியில் ஊறுகாய் சாதம்.",
    visual_scene: "காலியான பர்ஸைப் பார்த்து ஆச்சரியப்படும் இளைஞன்.",
    top_text: "மாதத்தின் 1ஆம் தேதி: 'பில் என்னவோ நான் போடுறேன்!'",
    bottom_text: "மாதத்தின் 25ஆம் தேதி: 'மச்சி 10 ரூபாய் இருந்தா குடேன்!'",
    caption: "பணம் எப்படி போகுதுனே தெரிய மாட்டேங்குது!",
    hashtags: ["#மாதஇறுதி", "#பணக்கஷ்டம்", "#தமிழ்நகைச்சுவை", "#சிரிப்பு"]
  }
];

export function getFallbackIdeas(
  topic: string,
  category: string = "Relatable Humor",
  style: string = "Witty",
  intensity: string = "Medium",
  language: string = "English",
  count: number = 5
): MemeIdea[] {
  const cleanTopic = topic.trim() || "Daily Life";
  const topicLower = cleanTopic.toLowerCase();

  if (language.toLowerCase() === "tamil") {
    const list = [...TAMIL_TEMPLATES].sort(() => 0.5 - Math.random());
    return list.slice(0, count);
  }

  if (language.toLowerCase() === "tanglish") {
    const list = [...TANGLISH_TEMPLATES].sort(() => 0.5 - Math.random());
    return list.slice(0, count);
  }

  let domain: "college" | "programming" | "general" = "general";
  if (topicLower.match(/code|program|dev|bug|python|react|git|tech|ai|software/)) {
    domain = "programming";
  } else if (topicLower.match(/college|exam|student|study|hostel|semester|attendance|assign/)) {
    domain = "college";
  }

  const pool = TOPIC_TEMPLATES[domain];
  const results: MemeIdea[] = [];

  const titles = [
    `The ${cleanTopic} Paradox`,
    `Expectation vs Reality: ${cleanTopic}`,
    `Survival Guide to ${cleanTopic}`,
    `The 2 AM ${cleanTopic} Epiphany`,
    `Nobody Asked for This: ${cleanTopic}`,
    `${cleanTopic} in a Nutshell`,
    `The Unspoken Rule of ${cleanTopic}`
  ].sort(() => 0.5 - Math.random());

  const captions = [
    `Why is this ${cleanTopic} situation attacking me personally right now?`,
    `If you've ever dealt with ${cleanTopic}, you know this exact feeling.`,
    `My therapist told me to stop stressing about ${cleanTopic}, so I made a meme.`,
    `Tag that one friend who embodies this ${cleanTopic} energy 24/7.`,
    `10/10 would choose sleep over dealing with ${cleanTopic} again.`
  ].sort(() => 0.5 - Math.random());

  for (let i = 0; i < Math.min(count, pool.top_bottom.length); i++) {
    const tb = pool.top_bottom[i % pool.top_bottom.length];
    const vis = pool.visuals[i % pool.visuals.length];
    results.push({
      title: titles[i % titles.length],
      concept: `A hilarious contrast highlighting how ${cleanTopic} feels compared to what was expected in ${category} style.`,
      visual_scene: `${vis} with dramatic meme lighting.`,
      top_text: tb[0],
      bottom_text: tb[1],
      caption: captions[i % captions.length],
      hashtags: [
        `#${cleanTopic.replace(/\s+/g, '')}`,
        `#${category.replace(/\s+/g, '')}`,
        "#MemeEconomy",
        "#RelatableHumor",
        "#TooReal"
      ]
    });
  }

  return results;
}

export function getFallbackCaptions(
  topic: string,
  tone: string = "Witty",
  language: string = "English",
  count: number = 5
): CaptionItem[] {
  const cleanTopic = topic.trim() || "Life";

  if (language.toLowerCase() === "tanglish") {
    const tanglish = [
      `${cleanTopic} pathi pesinaale tears automatic-ah varum bro! #Tanglish`,
      `Vera level timing! ${cleanTopic} irundha life set aagidum nu sonnanga! #MachiVibe`,
      `Enna da idhu pudhu sodhanai? ${cleanTopic} mudikka mudiyama thala valikkudhu!`,
      `Full confidence-oda vandhen, ${cleanTopic} paathadhum silence aayiten!`,
      `Pesaama oru chai kudichittu ${cleanTopic} continue pannuvom machan!`
    ];
    return tanglish.slice(0, count).map(c => ({ caption: c, tone, platform: "Instagram / Threads" }));
  }

  if (language.toLowerCase() === "tamil") {
    const tamil = [
      `${cleanTopic} பற்றி பேசினா சிரிப்பு கூடவே அழுகையும் வருது! #தமிழ்`,
      `நினைச்சது ஒன்னு, நடந்தது ${cleanTopic}! செம மொமண்ட்!`,
      `வாழ்க்கையில் எல்லாம் மாறும், ஆனா இந்த ${cleanTopic} மட்டும் மாறாது!`,
      `ஒரு டீயை குடிச்சிட்டு ${cleanTopic} சமாளிப்போம் நண்பா!`,
      `இதுக்கு மேல விளக்கம் தேவையில்லை... காட்சி பேசும்!`
    ];
    return tamil.slice(0, count).map(c => ({ caption: c, tone, platform: "Social Media" }));
  }

  const english = [
    `Me pretending ${cleanTopic} doesn't affect my sleep schedule at 3 AM.`,
    `If ${cleanTopic} was an Olympic sport, I’d take home the gold in overthinking.`,
    `Not me trying to romanticize ${cleanTopic} with an iced coffee.`,
    `Live, laugh, and question every life decision that led to this ${cleanTopic}.`,
    `Professional in the streets, utterly overwhelmed by ${cleanTopic} in the sheets.`,
    `Currently accepting emotional support snacks for dealing with ${cleanTopic}.`,
    `Some people have hobbies. My hobby is stressing over ${cleanTopic}.`
  ].sort(() => 0.5 - Math.random());

  return english.slice(0, count).map(c => ({ caption: c, tone, platform: "Instagram / Twitter" }));
}

export function getFallbackJokes(
  category: string = "College and Student Humor",
  style: string = "Witty",
  language: string = "English",
  count: number = 5
): JokeItem[] {
  if (language.toLowerCase() === "tanglish") {
    const tanglishJokes: JokeItem[] = [
      {
        type: "Q&A",
        setup: "Hostel mess-la chicken biryani-kum sambar rice-kum enna difference?",
        punchline: "Biryani-la oru tiny bone irukkum, sambar-la athuvum irukkaadhu!",
        tags: ["Hostel", "College", "Food"]
      },
      {
        type: "One-liner",
        setup: "Engineering padichu enna aachu nu ketaanga...",
        punchline: "Sleep cycle pochudhu, aana Google search skills NASA level-ku poiruchi!",
        tags: ["Engineering", "Students"]
      },
      {
        type: "Situational",
        setup: "Invigilator: 'Why are you copying from your friend?'",
        punchline: "Student: 'Sharing is caring nu primary school-la neengathaane sir solli thantheenga!'",
        tags: ["Exam", "College"]
      },
      {
        type: "Programming",
        setup: "A programmer's wife says: 'Go to the store and buy a loaf of bread. If they have eggs, buy a dozen.'",
        punchline: "He returns with 12 loaves of bread because they had eggs.",
        tags: ["Dev", "Logic"]
      },
      {
        type: "Puns",
        setup: "WiFi router-kum college degree-kum enna similarity?",
        punchline: "Rendume disconnection aana dhaan reality theriyum!",
        tags: ["Tech", "College"]
      }
    ];
    return tanglishJokes.slice(0, count);
  }

  const jokes: JokeItem[] = [
    {
      type: "Q&A",
      setup: "Why do programmers prefer dark mode?",
      punchline: "Because light attracts bugs!",
      tags: ["Programming", "Tech", "Classic"]
    },
    {
      type: "One-liner",
      setup: "My degree taught me that sleep is a myth invented by mattress corporations.",
      punchline: "Now back to my 4th cup of instant coffee.",
      tags: ["College", "Relatable"]
    },
    {
      type: "Programming",
      setup: "There are 10 types of people in the world:",
      punchline: "Those who understand binary, and those who don't.",
      tags: ["Developer", "Nerd"]
    },
    {
      type: "College",
      setup: "Student: 'Can I write this final exam in blue or black ink?'",
      punchline: "Professor: 'Write it with your tears if you must, just don't leave it blank.'",
      tags: ["Exam", "College"]
    },
    {
      type: "Puns",
      setup: "Why was the math book always crying?",
      punchline: "Because it had too many problems of its own.",
      tags: ["Math", "Pun"]
    },
    {
      type: "Situational",
      setup: "I told my doctor I get panic attacks whenever someone knocks on my door.",
      punchline: "He told me to stop ordering food delivery from three different apps simultaneously.",
      tags: ["Life", "Relatable"]
    },
    {
      type: "One-liner",
      setup: "Debugging is like being the detective in a crime movie where you are also the murderer.",
      punchline: "And you left fingerprints on every line of code.",
      tags: ["Dev", "Humor"]
    }
  ].sort(() => 0.5 - Math.random());

  return jokes.slice(0, count);
}
