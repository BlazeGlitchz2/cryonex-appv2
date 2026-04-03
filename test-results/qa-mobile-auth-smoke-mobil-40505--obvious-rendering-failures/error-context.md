# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: qa/mobile-auth-smoke.spec.ts >> mobile auth supports guest entry without obvious rendering failures
- Location: qa/mobile-auth-smoke.spec.ts:10:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 4

- Array []
+ Array [
+   "Origin http://127.0.0.1:4179 is not allowed by Access-Control-Allow-Origin. Status code: 403",
+   "Failed to load resource: Origin http://127.0.0.1:4179 is not allowed by Access-Control-Allow-Origin. Status code: 403",
+ ]
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - banner [ref=e5]:
        - generic [ref=e6]:
          - button [ref=e7] [cursor=pointer]:
            - img
          - generic [ref=e8]:
            - paragraph [ref=e9]: Dashboard
            - paragraph [ref=e10]: Today in Cryonex
        - button "Open assistant" [ref=e11] [cursor=pointer]:
          - img
      - main [ref=e12]:
        - generic [ref=e16]:
          - generic [ref=e17]:
            - generic [ref=e18]:
              - generic [ref=e19]:
                - generic [ref=e20]:
                  - generic [ref=e21]:
                    - img [ref=e22]
                    - text: Personalized phone study OS
                  - generic [ref=e24]: 🌍 Global
                - generic [ref=e25]:
                  - generic [ref=e26]: Welcome back
                  - heading "Your mobile study lane is ready." [level=1] [ref=e27]
                  - paragraph [ref=e28]: Capture one source and Cryonex will tune this phone dashboard around your next review step.
                - generic [ref=e29]:
                  - button "Capture a new source Upload, scan, or paste one source to unlock the rest of the study flow." [ref=e30]:
                    - generic [ref=e31]:
                      - img [ref=e33]
                      - img [ref=e36]
                    - paragraph [ref=e38]: Capture a new source
                    - paragraph [ref=e39]: Upload, scan, or paste one source to unlock the rest of the study flow.
                  - button "Open Study Copilot Use the same mobile prompt lane for guided revision, quizzes, and follow-up questions." [ref=e40]:
                    - generic [ref=e41]:
                      - img [ref=e43]
                      - img [ref=e45]
                    - paragraph [ref=e47]: Open Study Copilot
                    - paragraph [ref=e48]: Use the same mobile prompt lane for guided revision, quizzes, and follow-up questions.
              - generic [ref=e49]:
                - generic [ref=e50]:
                  - paragraph [ref=e51]: Study pulse
                  - generic [ref=e52]: Mobile tuned
                - generic [ref=e53]:
                  - paragraph [ref=e54]: Momentum
                  - paragraph [ref=e55]: No source loaded yet
                  - paragraph [ref=e56]: Use a short session to build momentum once your material is ready.
                - generic [ref=e57]:
                  - generic [ref=e58]:
                    - paragraph [ref=e59]: Curriculum
                    - paragraph [ref=e60]: General
                    - paragraph [ref=e61]: Used to personalize practice lanes and pacing.
                  - generic [ref=e62]:
                    - paragraph [ref=e63]: Region
                    - paragraph [ref=e64]: Global
                    - paragraph [ref=e65]: Keeps the mobile brief aligned with your school context.
                  - generic [ref=e66]:
                    - paragraph [ref=e67]: Today
                    - paragraph [ref=e68]: Goals ready to set
                    - paragraph [ref=e69]: Add a goal to turn the dashboard into a daily control surface.
            - generic [ref=e70]:
              - generic [ref=e71]:
                - paragraph [ref=e72]: Coach this lane
                - textbox "I want to study biology, revise math, or turn notes into a quiz..." [ref=e73]
                - generic [ref=e74]:
                  - button "Open Study Copilot" [ref=e75]:
                    - text: Open Study Copilot
                    - img [ref=e76]
                  - button "Open Chat" [ref=e78]
                  - button "Capture a new source Upload, scan, or paste one source to unlock the rest of the study flow." [ref=e79]:
                    - paragraph [ref=e80]: Capture a new source
                    - paragraph [ref=e81]: Upload, scan, or paste one source to unlock the rest of the study flow.
                  - button "Start a focus sprint Use a short session to build momentum once your material is ready." [ref=e82]:
                    - paragraph [ref=e83]: Start a focus sprint
                    - paragraph [ref=e84]: Use a short session to build momentum once your material is ready.
                  - button "Quiz Test me quickly" [ref=e85]:
                    - paragraph [ref=e86]: Quiz
                    - paragraph [ref=e87]: Test me quickly
                  - button "Upload Capture new material" [ref=e88]:
                    - paragraph [ref=e89]: Upload
                    - paragraph [ref=e90]: Capture new material
              - generic [ref=e91]:
                - paragraph [ref=e92]: Today on mobile
                - generic [ref=e93]:
                  - generic [ref=e94]:
                    - paragraph [ref=e95]: School
                    - paragraph [ref=e96]: Independent learner
                  - generic [ref=e97]:
                    - paragraph [ref=e98]: Coach prompt
                    - paragraph [ref=e99]: Build a calm general revision plan for me
                  - generic [ref=e100]:
                    - paragraph [ref=e101]: Mobile behavior
                    - paragraph [ref=e102]: Safe-area padding, denser taps, and a tighter sequence from capture to review.
            - generic [ref=e103]:
              - generic [ref=e104]:
                - generic [ref=e105]: Country
                - generic [ref=e106]: Global
              - generic [ref=e107]:
                - generic [ref=e108]: Privacy
                - generic [ref=e109]: private
              - generic [ref=e110]:
                - generic [ref=e111]: Network
                - generic [ref=e112]: Private by default
              - generic [ref=e113]:
                - generic [ref=e114]: Grade
                - generic [ref=e115]: Not set
          - generic [ref=e116]:
            - generic [ref=e117]:
              - generic [ref=e118]:
                - generic [ref=e119]:
                  - generic [ref=e120]:
                    - generic [ref=e121]: Study time
                    - paragraph [ref=e122]: 0m
                  - img [ref=e124]
                - paragraph [ref=e127]: tracked across focused sessions
                - generic [ref=e130]:
                  - generic [ref=e131]: 120m focus target
                  - generic [ref=e132]: 0%
              - generic [ref=e133]:
                - generic [ref=e134]:
                  - generic [ref=e135]:
                    - generic [ref=e136]: Current streak
                    - paragraph [ref=e137]: 0d
                  - img [ref=e139]
                - paragraph [ref=e141]: 0h total this week
                - generic [ref=e144]:
                  - generic [ref=e145]: 14-day consistency push
                  - generic [ref=e146]: 0%
              - generic [ref=e147]:
                - generic [ref=e148]:
                  - generic [ref=e149]:
                    - generic [ref=e150]: Credits
                    - paragraph [ref=e151]: "100"
                  - img [ref=e153]
                - paragraph [ref=e158]: Earn more with focus sessions and refuels
                - generic [ref=e161]:
                  - generic [ref=e162]: 50-credit reserve
                  - generic [ref=e163]: 100%
            - generic [ref=e164]:
              - button "Review lane 0 cards ready Spaced review Clear the due queue before it grows cold and expensive to recover. Best for fast recall Great as the first move when you open the dashboard. Open mode" [ref=e165]:
                - generic [ref=e166]:
                  - generic [ref=e167]:
                    - img [ref=e169]
                    - generic [ref=e171]: Review lane
                  - generic [ref=e172]:
                    - generic [ref=e173]: 0 cards ready
                    - heading "Spaced review" [level=3] [ref=e174]
                    - paragraph [ref=e175]: Clear the due queue before it grows cold and expensive to recover.
                  - generic [ref=e176]:
                    - generic [ref=e177]:
                      - paragraph [ref=e178]: Best for fast recall
                      - paragraph [ref=e179]: Great as the first move when you open the dashboard.
                    - generic [ref=e180]:
                      - text: Open mode
                      - img [ref=e181]
              - button "Practice lane Exam simulation Adaptive quiz Pressure-test what you know and expose the weak spots quickly. Best for gap finding Use when you need feedback, not just familiarity. Open mode" [ref=e183]:
                - generic [ref=e184]:
                  - generic [ref=e185]:
                    - img [ref=e187]
                    - generic [ref=e199]: Practice lane
                  - generic [ref=e200]:
                    - generic [ref=e201]: Exam simulation
                    - heading "Adaptive quiz" [level=3] [ref=e202]
                    - paragraph [ref=e203]: Pressure-test what you know and expose the weak spots quickly.
                  - generic [ref=e204]:
                    - generic [ref=e205]:
                      - paragraph [ref=e206]: Best for gap finding
                      - paragraph [ref=e207]: Use when you need feedback, not just familiarity.
                    - generic [ref=e208]:
                      - text: Open mode
                      - img [ref=e209]
              - button "Speed lane Warm-up reps Memory match Run short, playful reps when you want momentum without setup. Best for energy resets Useful between deeper study blocks. Open mode" [ref=e211]:
                - generic [ref=e212]:
                  - generic [ref=e213]:
                    - img [ref=e215]
                    - generic [ref=e217]: Speed lane
                  - generic [ref=e218]:
                    - generic [ref=e219]: Warm-up reps
                    - heading "Memory match" [level=3] [ref=e220]
                    - paragraph [ref=e221]: Run short, playful reps when you want momentum without setup.
                  - generic [ref=e222]:
                    - generic [ref=e223]:
                      - paragraph [ref=e224]: Best for energy resets
                      - paragraph [ref=e225]: Useful between deeper study blocks.
                    - generic [ref=e226]:
                      - text: Open mode
                      - img [ref=e227]
          - generic [ref=e229]:
            - generic [ref=e230]:
              - generic [ref=e231]: Study Sets
              - heading "What do you want to master?" [level=2] [ref=e232]
              - paragraph [ref=e233]: Upload, paste, or record and turn it into focused revision material.
            - generic [ref=e234]:
              - button "Upload PDFs, screenshots, and files." [ref=e235]:
                - img [ref=e237]
                - heading "Upload" [level=3] [ref=e240]
                - paragraph [ref=e241]: PDFs, screenshots, and files.
              - button "Paste Lecture notes, excerpts, bilingual text." [ref=e242]:
                - img [ref=e244]
                - heading "Paste" [level=3] [ref=e247]
                - paragraph [ref=e248]: Lecture notes, excerpts, bilingual text.
              - button "Record Capture a lecture and build a study pack." [ref=e249]:
                - img [ref=e251]
                - heading "Record" [level=3] [ref=e254]
                - paragraph [ref=e255]: Capture a lecture and build a study pack.
            - generic [ref=e257]:
              - generic [ref=e258]:
                - generic [ref=e259]: Quick modes
                - heading "Jump into the next best lane" [level=3] [ref=e260]
                - paragraph [ref=e261]: The strongest next action is already above. This lane stays here to keep a quiet reminder visible while you scroll.
              - generic [ref=e262]: 0 due
          - generic [ref=e263]:
            - generic [ref=e264]:
              - paragraph [ref=e265]: Explore
              - heading "Browse your study shelf" [level=2] [ref=e266]
            - button "All" [ref=e268]
          - generic [ref=e269]:
            - generic [ref=e270]:
              - generic [ref=e271]:
                - generic [ref=e272]:
                  - generic [ref=e273]:
                    - img [ref=e274]
                    - text: Next Actions
                  - heading "Continue with the highest-impact move." [level=2] [ref=e276]
                  - paragraph [ref=e277]: "Built for speed-to-value: every action starts from your uploaded source material instead of generic prompts."
                - generic [ref=e278]:
                  - generic [ref=e279]: "Curriculum: general"
                  - generic [ref=e280]: "Region: global"
                  - generic [ref=e281]: English-first mode
              - generic [ref=e282]:
                - button "Start spaced review Warm up your memory lane Open" [ref=e283]:
                  - generic [ref=e284]:
                    - generic [ref=e285]:
                      - paragraph [ref=e286]: Start spaced review
                      - paragraph [ref=e287]: Warm up your memory lane
                    - img [ref=e289]
                  - generic [ref=e292]:
                    - text: Open
                    - img [ref=e293]
                - button "Open your latest source Grounded answers from your own material Open" [ref=e295]:
                  - generic [ref=e296]:
                    - generic [ref=e297]:
                      - paragraph [ref=e298]: Open your latest source
                      - paragraph [ref=e299]: Grounded answers from your own material
                    - img [ref=e301]
                  - generic [ref=e304]:
                    - text: Open
                    - img [ref=e305]
                - button "Run an adaptive quiz Find gaps before the exam finds them Open" [ref=e307]:
                  - generic [ref=e308]:
                    - generic [ref=e309]:
                      - paragraph [ref=e310]: Run an adaptive quiz
                      - paragraph [ref=e311]: Find gaps before the exam finds them
                    - img [ref=e313]
                  - generic [ref=e316]:
                    - text: Open
                    - img [ref=e317]
                - button "Start a focus block Short deep-work burst to finish your day Open" [ref=e319]:
                  - generic [ref=e320]:
                    - generic [ref=e321]:
                      - paragraph [ref=e322]: Start a focus block
                      - paragraph [ref=e323]: Short deep-work burst to finish your day
                    - img [ref=e325]
                  - generic [ref=e328]:
                    - text: Open
                    - img [ref=e329]
              - generic [ref=e331]:
                - generic [ref=e332]:
                  - paragraph [ref=e333]: Regional study lane
                  - paragraph [ref=e334]: Enable your region in onboarding/settings for local exam and language personalization.
                - button "Add Source" [ref=e336]:
                  - img [ref=e337]
                  - text: Add Source
            - generic [ref=e340]:
              - generic [ref=e341]:
                - generic [ref=e342]:
                  - generic [ref=e343]:
                    - img [ref=e344]
                    - text: Recently captured
                  - generic [ref=e350]:
                    - heading "Continue from your latest sources" [level=2] [ref=e351]
                    - paragraph [ref=e352]: Keep your current sources visible, resumable, and one tap away from the tools that use them.
                - generic [ref=e353]:
                  - generic [ref=e354]: 0 in view
                  - button "Open library" [ref=e355] [cursor=pointer]
              - generic [ref=e356]:
                - paragraph [ref=e357]: No recent material yet
                - paragraph [ref=e358]: Upload a source once and the whole dashboard starts working for you.
                - button "Upload your first source" [ref=e359] [cursor=pointer]
          - generic [ref=e360]:
            - generic [ref=e361]:
              - generic [ref=e362]:
                - generic [ref=e363]:
                  - img [ref=e364]
                  - text: Study packs
                - heading "Bundle the best parts of one source into a pack." [level=3] [ref=e368]
                - paragraph [ref=e369]: Each pack keeps the summary, key review points, flashcards, quiz practice, and sharing controls attached to the same source material.
              - generic [ref=e370]:
                - button "Make from notes" [ref=e371] [cursor=pointer]:
                  - img
                  - text: Make from notes
                - button "Upload source" [ref=e372] [cursor=pointer]:
                  - img
                  - text: Upload source
            - generic [ref=e374]:
              - generic [ref=e375]:
                - paragraph [ref=e376]: No study packs yet
                - paragraph [ref=e377]: Upload, paste, or record once. Cryonex will package the source into a reusable pack with review structure and a clean sharing path.
              - button "Start first pack" [ref=e379] [cursor=pointer]:
                - img
                - text: Start first pack
          - generic [ref=e380]:
            - generic [ref=e381]:
              - generic [ref=e382]:
                - paragraph [ref=e383]: Community
                - heading "Browse your shared study network" [level=2] [ref=e384]
              - generic [ref=e385]:
                - generic [ref=e387]:
                  - generic [ref=e388]:
                    - img [ref=e389]
                    - text: School
                  - heading "Popular at your school" [level=3] [ref=e394]
                  - paragraph [ref=e395]: What your classmates are sharing right now.
                - generic [ref=e396]: School shared study assets will appear here once classmates publish them.
              - generic [ref=e397]:
                - generic [ref=e399]:
                  - generic [ref=e400]:
                    - img [ref=e401]
                    - text: Regional
                  - heading "Trending in Global" [level=3] [ref=e406]
                  - paragraph [ref=e407]: Localized picks for your country and curriculum.
                - generic [ref=e408]: Regional study assets will appear here as your network grows.
            - generic [ref=e409]:
              - generic [ref=e410]:
                - img [ref=e411]
                - text: Schoolmates
              - heading "People worth following" [level=3] [ref=e416]
              - paragraph [ref=e417]: Discover classmates and creators from your school who are sharing useful notes and study packs.
              - generic [ref=e419]: No schoolmate suggestions yet. Once more students opt in and share assets, they will appear here.
          - generic [ref=e420]:
            - generic [ref=e421]:
              - generic [ref=e422]:
                - generic [ref=e423]:
                  - img [ref=e424]
                  - text: Local brief
                - heading "Student-safe updates for your area" [level=3] [ref=e426]
                - paragraph [ref=e427]: Pinned conflict coverage stays first. The rest of the brief stays localized and calm for school, safety, and mobility decisions.
              - button [ref=e428]:
                - img [ref=e429]
            - generic [ref=e434]:
              - generic [ref=e435]:
                - generic [ref=e436]:
                  - generic [ref=e437]:
                    - img [ref=e438]
                    - text: Iran-US conflict
                  - paragraph [ref=e440]: Latest first. Trusted war coverage for Iran-US escalation, regional impact, and Gulf disruption.
                - generic [ref=e441]:
                  - generic [ref=e442]: Latest first
                  - generic [ref=e443]: Trusted news only right now
              - generic [ref=e444]:
                - 'button "Iran war: What is happening on day 35 of US-Israeli attacks? Newsroom Al Jazeera 3 hours ago Iran war: What is happening on day 35 of US-Israeli attacks? The US-Israel war on Iran hit century-old medical research centre the Pasteur Institute and a bridge near Tehran. Listen (7 mins). Open source" [ref=e445]':
                  - 'img "Iran war: What is happening on day 35 of US-Israeli attacks?" [ref=e447]'
                  - generic [ref=e448]:
                    - generic [ref=e449]:
                      - generic [ref=e450]: Newsroom
                      - generic [ref=e451]: Al Jazeera
                      - generic [ref=e452]: 3 hours ago
                    - paragraph [ref=e453]: "Iran war: What is happening on day 35 of US-Israeli attacks?"
                    - paragraph [ref=e454]: The US-Israel war on Iran hit century-old medical research centre the Pasteur Institute and a bridge near Tehran. Listen (7 mins).
                    - generic [ref=e455]:
                      - text: Open source
                      - img [ref=e456]
                - button "As Trump doubles down on Iran war, markets shudder and oil prices climb Newsroom The Washington Post 4 hours ago As Trump doubles down on Iran war, markets shudder and oil prices climb With no immediate resolution to a dispute that's locked up oil and gas, the war with Iran is increasing economic pain and straining the U.S.... Open source" [ref=e460]:
                  - img "As Trump doubles down on Iran war, markets shudder and oil prices climb" [ref=e462]
                  - generic [ref=e463]:
                    - generic [ref=e464]:
                      - generic [ref=e465]: Newsroom
                      - generic [ref=e466]: The Washington Post
                      - generic [ref=e467]: 4 hours ago
                    - paragraph [ref=e468]: As Trump doubles down on Iran war, markets shudder and oil prices climb
                    - paragraph [ref=e469]: With no immediate resolution to a dispute that's locked up oil and gas, the war with Iran is increasing economic pain and straining the U.S....
                    - generic [ref=e470]:
                      - text: Open source
                      - img [ref=e471]
                - button "Iran vows retaliation after deadly US strike on bridge in Karaj Newsroom Al Jazeera 7 hours ago Iran vows retaliation after deadly US strike on bridge in Karaj NewsFeed. Iran vows retaliation after deadly US strike on bridge in Karaj. Published On 3 Apr 20263 Apr 2026. Save. Click here to share on social media. Open source" [ref=e475]:
                  - img "Iran vows retaliation after deadly US strike on bridge in Karaj" [ref=e477]
                  - generic [ref=e478]:
                    - generic [ref=e479]:
                      - generic [ref=e480]: Newsroom
                      - generic [ref=e481]: Al Jazeera
                      - generic [ref=e482]: 7 hours ago
                    - paragraph [ref=e483]: Iran vows retaliation after deadly US strike on bridge in Karaj
                    - paragraph [ref=e484]: NewsFeed. Iran vows retaliation after deadly US strike on bridge in Karaj. Published On 3 Apr 20263 Apr 2026. Save. Click here to share on social media.
                    - generic [ref=e485]:
                      - text: Open source
                      - img [ref=e486]
            - generic [ref=e490]:
              - generic [ref=e491]:
                - paragraph [ref=e492]: Local context
                - paragraph [ref=e493]: Prioritizes school closures, exam changes, campus advisories, and remote-learning shifts.
              - generic [ref=e494]: Official sources prioritized
            - generic [ref=e495]:
              - button "School" [ref=e496]:
                - img [ref=e497]
                - text: School
              - button "Safety" [ref=e500]:
                - img [ref=e501]
                - text: Safety
              - button "Mobility" [ref=e503]:
                - img [ref=e504]
                - text: Mobility
            - generic [ref=e508]:
              - button "'Transportation matter' results in remote learning for Western Pa. school district Newsroom WTAE 1 week ago 'Transportation matter' results in remote learning for Western Pa. school district Officials said students in the Hopewell Area School District will learn remotely for the rest of the week as the district works to fully... Open source" [ref=e509]:
                - img "'Transportation matter' results in remote learning for Western Pa. school district" [ref=e511]
                - generic [ref=e512]:
                  - generic [ref=e513]:
                    - generic [ref=e514]: Newsroom
                    - generic [ref=e515]: WTAE
                    - generic [ref=e516]: 1 week ago
                  - paragraph [ref=e517]: "'Transportation matter' results in remote learning for Western Pa. school district"
                  - paragraph [ref=e518]: Officials said students in the Hopewell Area School District will learn remotely for the rest of the week as the district works to fully...
                  - generic [ref=e519]:
                    - text: Open source
                    - img [ref=e520]
              - button "Hopewell Area School District switches to remote learning, works to resolve ‘transportation matter’ Newsroom WPXI 1 week ago Hopewell Area School District switches to remote learning, works to resolve ‘transportation matter’ The Hopewell Area School District will hold remote classes as administrators work to resolve a “transportation matter.” Open source" [ref=e524]:
                - img "Hopewell Area School District switches to remote learning, works to resolve ‘transportation matter’" [ref=e526]
                - generic [ref=e527]:
                  - generic [ref=e528]:
                    - generic [ref=e529]: Newsroom
                    - generic [ref=e530]: WPXI
                    - generic [ref=e531]: 1 week ago
                  - paragraph [ref=e532]: Hopewell Area School District switches to remote learning, works to resolve ‘transportation matter’
                  - paragraph [ref=e533]: The Hopewell Area School District will hold remote classes as administrators work to resolve a “transportation matter.”
                  - generic [ref=e534]:
                    - text: Open source
                    - img [ref=e535]
              - button "School closure presentation frustrates DeKalb County parents Newsroom WABE 1 week ago School closure presentation frustrates DeKalb County parents DeKalb County Schools has begun holding public input sessions on the latest proposal for closing schools, and hundreds of frustrated,... Open source" [ref=e539]:
                - img "School closure presentation frustrates DeKalb County parents" [ref=e541]
                - generic [ref=e542]:
                  - generic [ref=e543]:
                    - generic [ref=e544]: Newsroom
                    - generic [ref=e545]: WABE
                    - generic [ref=e546]: 1 week ago
                  - paragraph [ref=e547]: School closure presentation frustrates DeKalb County parents
                  - paragraph [ref=e548]: DeKalb County Schools has begun holding public input sessions on the latest proposal for closing schools, and hundreds of frustrated,...
                  - generic [ref=e549]:
                    - text: Open source
                    - img [ref=e550]
            - generic [ref=e554]:
              - generic [ref=e555]:
                - generic [ref=e556]: Latest first
                - generic [ref=e557]: School mode
              - button "Ask Cryonex" [ref=e558] [cursor=pointer]:
                - text: Ask Cryonex
                - img
            - paragraph [ref=e559]: Use official instructions over headlines whenever movement, closures, or evacuation guidance affects your area.
          - generic [ref=e560]:
            - generic [ref=e561]:
              - generic [ref=e562]:
                - generic [ref=e563]:
                  - generic [ref=e564]:
                    - generic [ref=e565]: Today plan
                    - generic [ref=e566]:
                      - heading "Daily goals" [level=3] [ref=e567]
                      - paragraph [ref=e568]: Keep the checklist small enough to finish so the dashboard feels like momentum, not admin.
                  - generic [ref=e569]:
                    - paragraph [ref=e570]: Progress
                    - paragraph [ref=e571]: 0/1
                    - paragraph [ref=e572]: 0% complete
                - generic [ref=e573]:
                  - textbox [ref=e575]:
                    - /placeholder: Add one clear outcome for today
                  - button "Add goal" [disabled] [ref=e576]:
                    - img [ref=e577]
                    - text: Add goal
                - generic [ref=e579]:
                  - paragraph [ref=e580]: No goals yet
                  - paragraph [ref=e581]: Add one concrete checkpoint and let the rest of the dashboard align around it.
                - generic [ref=e582]:
                  - generic [ref=e583]: 0 completed
                  - generic [ref=e584]: 0 remaining
                  - generic [ref=e585]: Start with one small win
              - generic [ref=e586]:
                - generic [ref=e587]:
                  - generic [ref=e588]:
                    - generic [ref=e589]: Momentum
                    - generic [ref=e590]:
                      - heading "Weekly rhythm" [level=3] [ref=e591]
                      - paragraph [ref=e592]: Watch the cadence, not just the totals. Consistency keeps your dashboard working for you.
                  - generic [ref=e593]:
                    - img [ref=e594]
                    - generic [ref=e597]: 0h this week
                - generic [ref=e598]:
                  - generic [ref=e602]: Sat
                  - generic [ref=e606]: Sun
                  - generic [ref=e610]: Mon
                  - generic [ref=e614]: Tue
                  - generic [ref=e618]: Wed
                  - generic [ref=e622]: Thu
                  - generic [ref=e626]: Fri
                - generic [ref=e627]:
                  - generic [ref=e628]:
                    - paragraph [ref=e629]: Strongest day
                    - paragraph [ref=e630]: Sat
                    - paragraph [ref=e631]: 0h of focused study
                  - generic [ref=e632]:
                    - paragraph [ref=e633]: Avg. pace
                    - paragraph [ref=e634]: 0.0h
                    - paragraph [ref=e635]: average study time per day this week
            - generic [ref=e636]:
              - generic [ref=e637]:
                - generic [ref=e638]:
                  - generic [ref=e639]: Mastery track
                  - heading "Level 1" [level=3] [ref=e640]
                  - paragraph [ref=e641]: Starter tier unlocked
                - img [ref=e643]
              - paragraph [ref=e646]: Your review activity, quiz work, and study sessions all push this bar forward.
              - generic [ref=e647]:
                - generic [ref=e648]:
                  - paragraph [ref=e649]: "0"
                  - paragraph [ref=e650]: total XP earned
                - generic [ref=e651]:
                  - paragraph [ref=e652]: This level
                  - paragraph [ref=e653]: 0/250 XP
              - generic [ref=e655]:
                - generic [ref=e656]: Level 1
                - generic [ref=e657]: 250 XP to level 2
              - generic [ref=e658]:
                - generic [ref=e659]:
                  - img [ref=e660]
                  - paragraph [ref=e662]: "0"
                  - paragraph [ref=e663]: quizzes
                - generic [ref=e664]:
                  - img [ref=e665]
                  - paragraph [ref=e668]: "0"
                  - paragraph [ref=e669]: cards
                - generic [ref=e670]:
                  - img [ref=e671]
                  - paragraph [ref=e675]: "0"
                  - paragraph [ref=e676]: materials
          - generic [ref=e677]:
            - generic [ref=e678]:
              - generic [ref=e679]:
                - generic [ref=e680]: Capture lane
                - heading "Record once, study from it everywhere." [level=2] [ref=e681]
              - img [ref=e683]
            - paragraph [ref=e686]: This recorder is now friendlier to device differences, including browsers that prefer non-WebM audio formats.
            - generic [ref=e687]:
              - generic [ref=e688]: Audio to notes
              - generic [ref=e689]: Review-ready output
            - generic [ref=e692]:
              - button "Start Recording" [ref=e693] [cursor=pointer]:
                - img
                - generic [ref=e694]: Start Recording
              - paragraph [ref=e695]:
                - text: Uses the best audio format available on this device.
                - generic [ref=e696]: Tap to allow microphone access when prompted.
    - navigation [ref=e698]:
      - generic [ref=e699]:
        - button "Home" [ref=e700]:
          - generic [ref=e701]:
            - img [ref=e702]
            - generic [ref=e707]: Home
        - button "Coach" [ref=e709]:
          - generic [ref=e710]:
            - img [ref=e711]
            - generic [ref=e713]: Coach
        - button "Capture" [ref=e715]:
          - img [ref=e718]
          - generic [ref=e723]: Capture
        - button "Library" [ref=e724]:
          - generic [ref=e725]:
            - img [ref=e726]
            - generic [ref=e728]: Library
        - button "C Profile" [ref=e730]:
          - generic [ref=e731]:
            - generic [ref=e735]: C
            - generic [ref=e737]: Profile
  - region "Notifications alt+T"
  - generic [ref=e740]:
    - paragraph [ref=e741]:
      - text: We use cookies to deliver and measure personalized ads (Google AdSense) and improve the product. See our
      - link "Privacy Policy" [ref=e742]:
        - /url: /privacy
      - text: . You can change your choice anytime in “Cookie settings”.
    - generic [ref=e743]:
      - button "Decline" [ref=e744] [cursor=pointer]
      - button "Accept all" [ref=e745] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect, devices } from "@playwright/test";
  2  | 
  3  | const baseURL = process.env.MOBILE_QA_BASE_URL || "http://127.0.0.1:4174";
  4  | 
  5  | test.use({
  6  |   ...devices["iPhone 13"],
  7  |   baseURL,
  8  | });
  9  | 
  10 | test("mobile auth supports guest entry without obvious rendering failures", async ({
  11 |   page,
  12 | }) => {
  13 |   const consoleErrors: string[] = [];
  14 | 
  15 |   page.on("console", (message) => {
  16 |     if (message.type() === "error") {
  17 |       consoleErrors.push(message.text());
  18 |     }
  19 |   });
  20 | 
  21 |   await page.goto("/auth", { waitUntil: "networkidle" });
  22 | 
  23 |   await expect(
  24 |     page.getByRole("button", { name: /preview workspace first/i }),
  25 |   ).toBeVisible();
  26 | 
  27 |   await page.screenshot({
  28 |     path: "test-results/mobile-auth-before-guest.png",
  29 |     fullPage: true,
  30 |   });
  31 | 
  32 |   await page.getByRole("button", { name: /preview workspace first/i }).click();
  33 |   await page.waitForLoadState("networkidle");
  34 | 
  35 |   await page.screenshot({
  36 |     path: "test-results/mobile-auth-after-guest.png",
  37 |     fullPage: true,
  38 |   });
  39 | 
  40 |   await expect(page).toHaveURL(/\/study\/dashboard/);
> 41 |   expect(consoleErrors).toEqual([]);
     |                         ^ Error: expect(received).toEqual(expected) // deep equality
  42 | });
  43 | 
```