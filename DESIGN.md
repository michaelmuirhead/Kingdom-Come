# Kingdom Come — Design Document

**Version:** 1.0 (design lock)
**Author:** Michael Muirhead
**Last updated:** May 2026

---

## Table of Contents

1. [Identity & Vision](#1-identity--vision)
2. [Core Design Pillars](#2-core-design-pillars)
3. [The World](#3-the-world)
4. [Pacing & Time](#4-pacing--time)
5. [System 1 — Economy](#5-system-1--economy)
6. [System 2 — Military](#6-system-2--military)
7. [System 3 — Diplomacy](#7-system-3--diplomacy)
8. [System 4 — Dynasty & Royal Family](#8-system-4--dynasty--royal-family)
9. [System 5 — Tech & Cultural Development](#9-system-5--tech--cultural-development)
10. [System 6 — Religion](#10-system-6--religion)
11. [System 7 — Internal Politics & Estates](#11-system-7--internal-politics--estates)
12. [System 8 — Ideology & Nation Personality](#12-system-8--ideology--nation-personality)
13. [Victory & Scoring](#13-victory--scoring)
14. [UI / iPad Considerations](#14-ui--ipad-considerations)
15. [Tech Stack](#15-tech-stack)
16. [Data Architecture](#16-data-architecture)
17. [Build Roadmap](#17-build-roadmap)
18. [Content Scope Summary](#18-content-scope-summary)

---

## 1. Identity & Vision

**Kingdom Come** is a grand strategy game spanning **1200 CE to ~1900 CE**, played on iPad as an installable PWA. Real historical map and starting nations. Play any kingdom on Earth — survive, dominate, trade, scheme, or transform. Your dynasty matters as much as your borders.

Inspired by Crusader Kings, Europa Universalis, and Victoria — but built lean for solo development with depth where it matters and abstraction where it doesn't. The Paradox feel comes from the *interactions* between systems, not from any single system's depth.

---

## 2. Core Design Pillars

1. **Play deep or play wide.** Trade republic, scholar-state, militant theocracy, conquering empire — all viable paths to high score.
2. **Your dynasty matters.** Rulers are characters whose traits bend the nation.
3. **Nations have souls.** Ideology shifts over centuries based on rulers, events, and the people in power.
4. **One game, many eras.** Medieval → Renaissance → Early Modern → Industrial, with tech, units, and government evolving meaningfully.
5. **iPad-first.** Pause-and-issue-orders pacing, large tap targets, no hover-dependent UI, gestures for pan/zoom.

---

## 3. The World

### Map

- **~400 provinces** worldwide, grouped into ~80 regions
- Covers Europe, North Africa, Middle East, Central Asia, India, East Asia, Southeast Asia, Sub-Saharan Africa, Americas (sparse, becomes relevant post-1450)
- **~80 starting nations** at 1200 CE, historically accurate

### Province data

Each province carries:
- Terrain, climate
- Base population
- Three sub-stats: Tax development, Production development, Manpower development
- Trade good (one of ~50)
- Religion, culture
- Controller, occupier
- Buildings present
- Fortification level
- Cultural Influence score
- Institution presence flags

### Major starting nations

**Tier 1 (full hand-authored content):** France, England, HRE, Byzantium, Ayyubid Sultanate, Song China, Castile, Aragon, Hungary, Kievan Rus successor

**Tier 2 (substantial content):** Portugal, Norway, Sweden, Denmark, Poland, Bohemia, Sicily, Papal States, Cumans, Khwarazmian Empire, Jin Dynasty, Goryeo, Kamakura Japan, Delhi Sultanate (forming), Khmer Empire, Pagan Kingdom, Mali (forming), Ethiopia, Kanem, Volga Bulgaria

**Tier 3 (minimal content):** ~50 smaller states — Italian city-states, Iberian Christian states, Crusader states (Jerusalem, Antioch, Tripoli, Cyprus), Mongol clans (pre-unification), Seljuk Sultanate of Rûm, smaller steppe / African / Asian / Pacific states

### Map modes (bottom dock toggles)

Political, Terrain, Trade, Religion, Culture, Diplomatic, Development, Dynasty

---

## 4. Pacing & Time

- **Single bookmark: 1200 CE** at v1
- Endgame: 1900 (full victory evaluation)
- **Monthly tick** at speeds 1×–5×
- **Pause-and-issue-orders** primary mode
- Auto-pauses on:
  - Ruler death and succession
  - War declarations against or by player
  - Major events requiring decision
  - Institution spawns affecting player
  - Marriage proposal responses
  - Estate demands
  - Archetype transitions
- Manual pause anytime via persistent tap target

---

## 5. System 1 — Economy

### Pricing

**Global single market.** Every trade good has one world price, fluctuating monthly with supply/demand. Simple, fast, legible. (Regional pricing tiers reserved as v2 enhancement.)

### Trade goods (~50, tiered)

**Strategic goods (~12):**
Spices, Silk, Tea, Coffee (later era), Sugar (later era), Tobacco (later era), Gold, Silver, Gems, Ivory, Incense, Dyes

**Commodity goods (~40):**
- *Agricultural:* Grain, Rice, Maize (post-1500), Wine, Olive Oil, Cheese, Honey, Hops, Fruit, Livestock
- *Materials:* Wood, Stone, Coal (later), Iron, Copper, Tin, Lead, Saltpeter (later)
- *Manufactured:* Cloth, Wool, Linen, Cotton (later), Leather, Glass, Pottery, Paper, Books (post-printing)
- *Maritime:* Fish, Salt, Naval Supplies, Whale Oil (later), Amber
- *Animal / Luxury:* Furs, Horses, Camels
- *Specialty:* Wax, Tar, Hemp, Flax, Brandy

Each good has: base price, demand curve, era availability, terrain suitability map.

### Province production

Province generates X units of its good per month based on:
- Base Production development
- Terrain modifier
- Buildings present (marketplace, workshop, manufactory)
- Stability modifiers (war, occupation, plague, unrest)

### Trade nodes

- **~30 nodes worldwide** with directional flow
- Examples: Venice, Genoa, Champagne, Lübeck, Constantinople, Alexandria, Baghdad, Hormuz, Calicut, Quanzhou
- Each province belongs to one node
- Nations control nodes via: provinces in catchment + merchants assigned + light ships (era-locked)
- Control determines slice of node's value collected
- **Multiple nations pull from same node** — secondary players can still profit meaningfully

### Estate cuts on province income

Province raw income splits between estates and the crown:

```
Province raw income
  → Estate cut (their owned share)
  → Crown income (reaches treasury)
```

**Default estate ownership at 1200 (Feudal):**
- Nobility: 35–50%
- Clergy: 15–25%
- Burghers: 5–15%
- Crown: remainder

Reforms restructure these shares over centuries.

### Province development

**Three sub-stats:** Tax, Production, Manpower (each 1–30 medieval, 50+ industrial)

**Passive growth (automatic in good conditions):**
- Province at peace
- Marketplace present
- Culture + religion match the owner
- Modifiers: −plague, −famine, −occupation, −unrest, −over-taxation
- Typical: +1 development per decade in good conditions

**Active growth (player spending):**
- Spend gold + admin points to manually develop
- Cost scales with current development
- Three separate sub-stat investments
- Caps by era

### Buildings

Era-gated tiers:
- **Marketplace** (any era) — boosts province trade value
- **Port** (coastal only) — boosts trade + naval capacity
- **Workshop** (medieval+) — boosts production goods
- **Manufactory** (early modern+) — major production multiplier
- **Bank** (early modern+) — loan capacity + interest income
- **University** (any era, expensive) — tech generation
- **Temple / Cathedral / Mosque / etc.** (religious) — tax + religious unity
- **Walls / Star Fort / Modern Fortification** (defense)
- **Barracks** (military) — manpower
- **Embassy** (Renaissance+) — diplomatic capacity
- **Inquisition Tribunal** (Catholic, era-flagged) — conversion speed
- **Interfaith Center / Cosmopolitan Quarter** (high tolerance) — cultural + trade bonus

### National income

```
Income:
  + Crown share of all provincial income
  + Trade node share (control × node value)
  + Tariffs on foreign trade in your nodes
  + Tribute from vassals
  + Loan principal (when taken)

Expenses:
  − Army upkeep
  − Navy upkeep
  − Building construction
  − Court costs (scales with prestige + ruler vanity)
  − Loan interest
  − Subsidies to allies
  − Estate privileges (one-time grants)
```

### Loans

- Take loans at interest
- Default has heavy consequences: prestige hit, allied opinion drops, estate loyalty crashes, possible debt-collector wars (later eras)
- Banks reduce interest rate and raise borrowing ceiling

### Player levers (monthly/yearly)

- Tax rate per estate
- Build queue per province
- Merchant assignments
- Tariff rates
- Subsidies to allies

---

## 6. System 2 — Military

### Manpower

Each province has a regenerating manpower pool. Total national = sum across owned provinces.

**Modifiers:**
- Base from population + Manpower sub-stat
- Buildings (Barracks tiers)
- Terrain (mountains and steppe yield more per pop)
- Culture + religion match
- Estates (Nobility cut under feudalism)

### Feudal levies — temporary and costly

**Under Feudal Monarchy (1200 default):**
- Manpower splits: Crown levies (small, instant) + Feudal levies (large, owned by Nobility)
- **Feudal levies must be Called** — one-time action
  - Raises a batch of regiments immediately
  - **40-day service limit** (historical real)
  - Heavy Nobility loyalty hit (−15 per call, stacking)
  - Compounds within 5 years
- Past the limit, desertion at 1% per week
- Offensive war costs more loyalty than defensive
- Harvest season (June–September) doubles loyalty cost

**Government reform progression:**
- **Feudal Monarchy** (1200) — 70% feudal, 30% crown
- **Administrative Monarchy** (~1400+) — 50/50, levy service extends to 90 days
- **Standing Army reform** (~1600+) — abolish feudal levies, all crown, upkeep doubles
- **Conscription** (~1800+) — massive pool, Peasants estate loyalty becomes factor

**Non-feudal templates:**
- **Theocracies** — Clergy holds equivalent levies
- **Republics** — no feudal system, mercenary-reliant
- **Steppe Hordes** — all tribal levy, unity loyalty as constant struggle
- **Mamluk/Ghulam sultanates** — slave-soldier estate, expensive but politically neutral

### Regiments and armies

- **Regiment** = abstract ~1000 men
- Raised from province (costs manpower + gold + time)
- Armies = stacks under a single general
- Movement: weeks-to-months by terrain + infrastructure

### Unit types by era

- **Medieval (1200–1450):** Feudal Levies, Men-at-Arms, Knights, Crossbowmen, Longbowmen
- **Renaissance (1450–1600):** Pikemen, Arquebusiers, Gendarmes, Cannons
- **Early Modern (1600–1800):** Line Infantry, Dragoons, Cuirassiers, Field Artillery
- **Industrial (1800+):** Riflemen, Hussars, Heavy Artillery, early Machine Guns

Each unit: cost, upkeep, attack, defense, manpower requirement, era availability, terrain modifiers.

### Generals

Ideally from royal family (sons, brothers, cousins) or hired (nobles, mercenary captains).

**Stats:**
- Martial (0–25)
- 2–3 traits (Brilliant Strategist, Drillmaster, Cautious, Reckless, Siege Master, etc.)
- Loyalty

### Combat width

Battles have **combat width** — max regiments engaging at once. Reserves rotate as front-line regiments take damage or break morale.

**Combat width determinants:**
- **Terrain**: open plains 30, hills 22, mountains 14, forest 18, desert 20, river crossing 10
- **General modifiers**: Drillmaster +4, Cautious −2
- **Era**: 1200 base 20 → 1500 base 25 → 1700 base 30 → 1850 base 35

### Abstracted combat formula

```
side_effectiveness = numbers × tech × general_skill × morale
                   × terrain_mod × ideology_mod × unit_composition_mod
```

Output: casualties (% of regiments), morale damage, winner takes province or retreats, loser may rout entirely.

### Attrition

Armies in hostile provinces suffer monthly attrition:
- Exceed province supply limit (1k men per dev point baseline)
- Hostile territory (enemy-controlled)
- Winter season effects
- Plague presence

Attrition: 1–3% manpower per month per condition, stacking.

### Sieges

Monthly progress rolls modified by:
- Siege weapons (era-locked: trebuchets → bombards → siege artillery → modern guns)
- Fort level (Wooden Walls → Stone Walls → Star Forts → Modern Fortifications)
- Garrison size
- Attacker army size (2× garrison minimum)
- Generals with Siege Master trait

A star fort can hold 2+ years against medieval-tech army.

### Navies

Ship types by era:
- **Medieval:** Galleys, Cogs, Carracks (late)
- **Renaissance:** Caravels, Galleons
- **Early Modern:** Ships of the Line, Frigates
- **Industrial:** Ironclads, Steamships

**Naval roles:** blockade, escort trade, raid commerce, transport armies, patrol nodes.

### Naval invasions — full modeling

**Transport ships:**
- Separate class
- 1 regiment per transport
- Built at ports, cheap, vulnerable

**Invasion sequence:**
1. Build/have transports in port (capacity = regiments)
2. Embark army (1 month, vulnerable to attack)
3. Sail to target (weeks by distance)
4. **Naval supremacy check** — if enemy fleet stronger in sea zone, invasion intercepted (transports lost = army drowned)
5. Disembark (2 weeks, vulnerable to coastal army)
6. Normal land operations resume

**Naval supremacy** = sea-zone-by-sea-zone fleet comparison, modified by base distance.

### Trade-nation military identity

**Republics / high-Mercantile ideology nations get:**
- −25% mercenary cost, −25% upkeep
- +50% mercenary recruitment cap
- −40% native manpower pool
- +30% naval combat effectiveness
- +25% trade node control retention during war

**Militarist Agrarian nations get:**
- +30% native manpower pool
- −15% manpower regeneration time
- +15% mercenary cost
- −10% trade efficiency during war

**Proxy war mechanics (1500+):**
- **Subsidize a Belligerent**: monthly gold to nation at war with rival
- **Sponsor a Pretender**: fund a claimant's revolt in rival territory
- **Hire Privateers** (1500+): unofficial naval raiders, deniable

### Wars

**Casus Belli (CB) required to avoid penalties:**
- Conquest (annex specific provinces, requires Claim)
- Reconquest (within 30 years, time-decaying)
- Holy War (different faith)
- Imperial Reclamation (HRE-specific)
- Trade War (force open ports / break embargoes)
- Vassalization (force weaker neighbor to submit)
- Humiliate (prestige goal)
- Independence (vassal breaking free)
- Succession (dynastic claim)
- Reduce Threat (coalition CB)
- Doctrinal Reclamation (intra-faith schism wars)
- Heresy Suppression
- Religious Civil War / War of Religious Doctrine

**Declaring without CB:** −2 stability, large prestige loss, opinion −20 globally, allies may refuse call. Mongols don't care (era + ideology flag).

### War score

Accumulates from: battles won, provinces occupied, war goal ticking, blockades, capital captured. Ranges −100 to +100.

**Peace deal scale:**
- 25%: minor concession (1–2 provinces, gold, conversion)
- 50%: meaningful (multiple provinces, force release vassal)
- 75%: major (province cluster, vassalization, forced conversion)
- 100%: total (full annexation, regime change, puppet)

**Separate peace** possible in coalition wars.

### Allies and call-to-arms

Allies evaluate based on:
- Opinion
- Their commitments
- Win assessment
- Royal marriages
- Subsidies
- Ideology overlap

Refusing call costs opinion. Repeated refusals break alliances.

---

## 7. System 3 — Diplomacy

### Opinion system

Every nation tracks opinion of every other (−200 to +200), updated monthly.

**Modifiers:**
- Ideology overlap (radar chart distance)
- Religious alignment
- Recent actions (decaying)
- Royal marriages (active +20; heir produced +40)
- Trade rivalry
- Border friction
- AI personality baseline
- Diplomatic Reputation
- Honor

### AI foreign policy — proactive

Every AI nation has:

**Ambitions (1–3 active):**
- Concrete goals actively pursued
- Examples: "Reclaim Aquitaine" (France 1200), "Restore Roman Anatolia" (Byzantium), "Unify the German lands" (HRE), "Drive Crusaders into the sea" (Ayyubids), "Control Champagne Fairs" (mercantile neighbors), "Convert the Baltic pagans" (Teutonic Order, Denmark, Poland)
- Drive war declarations, alliance choices, claim fabrication, marriage proposals
- Retire on accomplishment, new ones spawn by era + ruler

**Rivals (0–3 active):**
- Define-against relationships
- Generate ongoing opinion penalties both ways
- Drive proactive hostile actions
- Examples: France ↔ England, Byzantium ↔ Bulgaria, Castile ↔ Almohads, Song ↔ Jin, Kamakura ↔ rival clans

**Interests (regional caring):**
- Softer than ambitions
- Italian Peninsula for HRE, France, Aragon, Papal States, Byzantium
- Pull nation into wars affecting interest regions

**Ruler personality overlay:**
- Zealous king adds "Lead a Crusade"
- Greedy prioritizes economic ambitions
- Wroth picks more rivals
- New ruler can change foreign policy mid-game

**Ideology overlay:**
- Militarist = more ambitions/rivals
- Theocratic = religious ambitions weighted
- Mercantile = trade-node ambitions weighted

### Diplomatic actions

**Always available:**
- Send Envoy
- Insult
- Improve Relations
- Embargo

**Opinion-gated:**
- Royal Marriage (+25)
- Alliance (+75)
- Guarantee Independence (+30)
- Non-Aggression Pact (+20)

**Hostile:**
- Fabricate Claim (intrigue)
- Sponsor Pretender (era-locked)
- Insult / Rivalry

**Vassal/tributary:**
- Demand Tribute
- Vassalize
- Release Vassal

**New ambient actions:**
- Claim Sphere of Influence (Great Power era only)
- Call for Coalition
- Lobby Pope (Catholic)
- Support Pretender
- Demand Concession (Great Power era)

### Coalitions — Threat-based, persuasion-driven

**Threat value** calculated from:
- Recent conquests (last 20 years, weighted by dev)
- Treaty violations
- Aggressive Expansion score
- Borders weight 2× higher
- Interest regions weight 1.5×

**Threat enables coalitions** — doesn't auto-form. Any nation can:
- **Call for Coalition** action — proposes defensive league against target
- Other nations evaluate based on own Threat reading + opinion + ideology + ambitions

**Coalition mechanics:**
- Members commit to defensive war against target
- Target declares on any member → all join
- Members can offensively declare with **Reduce Threat CB** (limited peace: force release, force-break alliances, prestige damage, indemnity)
- Dissolves when Threat drops below threshold sustained

**Late-game evolution:**
- Post-Westphalia (1648+): formalize as Balance of Power doctrine
- Industrial (1815+): Concert of Europe style multilateral diplomacy

### Religious diplomacy — full subsystem

**Papal Authority (Catholic, 1200–~1700):**
- Pope is full character (see Religion)
- Papal Favor score per Catholic nation (−100 to +100)
- Generated by: tithes, crusades joined, heretic suppression, churches built, donations to Holy See
- Lost by: ignoring calls, taxing clergy, fighting other Catholics
- Benefits at high favor: papal blessing on wars, legitimacy, Crusader CB access
- Excommunication: free Holy War CB for all Catholics, subject loyalty crash, allies may abandon

**Called Crusades (1200–~1400):**
- Pope calls Crusade against target (Levant, Iberia, Baltic, heretics)
- Catholic players can join: prestige, papal favor, Crusader CB, claims
- Refusing costs Papal Favor + Catholic opinion
- Player can lobby Pope to call useful Crusade

**Religious Leagues:**
- Stronger than alliances — same-faith, automatic call on religious wars, joint coalitions
- Catholic League, Sunni alliance vs Crusaders, Schmalkaldic League (Reformation), Orthodox League

**Reformation event chain (~1500+):**
- Triggers somewhere Catholic Europe (printing press, low papal authority, reformer ruler)
- Spawns Lutheran, Reformed/Calvinist, Anglican
- Counter-Reformation decisions for Catholic nations
- 100+ years of religious war content

**Parallel structures:**
- **Sunni Caliphate authority** — Abbasid An-Nasir 1200; collapses 1258 Baghdad sack
- **Shia Imamate** — Marja system, distributed
- **Patriarchates** — Constantinople, Antioch, Alexandria, Jerusalem; Moscow appears post-1589
- **Buddhist Sangha** networks — looser, advisory
- **Hindu temple networks** — caste and temple authority
- **Norse/Pagan** — tribal, mostly extinct by 1200
- **Tengri tolerance** — Mongol syncretic

### Great Power rank — Westphalia and after

**No formal Great Power status before 1648.** Informal Prestige Tiers (City-State, County, Duchy, Kingdom, Empire) provide medieval texture.

**1648 Westphalia event** establishes Great Power status:
- Top 8 nations by (development × tech × military × prestige × diplomatic rep)
- Recalculated annually
- Benefits: Veto on actions in interest regions; Sphere of Influence claims; Congress invitations required for major peace deals; +3 diplomatic slots; Prestige floor
- Falling out = major event ("decline of Spain"), prestige hit, internal unrest, ideology shifts

**Industrial era (1815+):** Concert of Europe layered on top — formal multilateral congresses, joint interventions, "sick man" partition diplomacy.

### Personal Unions — full mechanics

**PU formation triggers** when heir has recognized claim on another throne via marriage.

**Claim challenges:** other claimants may dispute → succession crisis wars at PU formation moment.

**Senior partner / Junior partner:**
- Senior (player) stays controlled
- Junior is AI-controlled but loyally allied: auto-alliance, auto-call-to-arms, royal marriage benefits, shared foreign policy, ideology drift toward senior
- Player can issue limited orders (troops, gold, declare specific wars)
- Junior partially feeds senior economy via subsidies/tributary

**Junior partner loyalty:**
- Separate from estate loyalty
- Lowered by: senior losing wars, senior diverging ideology, junior gaining strong own dynasty heir, estates demanding independence, ruler unpopularity, religious split
- Raised by: shared wars won, dynastic intermarriage, ideological alignment, fair treatment

**Breaking out (junior side):**
- Below loyalty threshold, junior declares independence war
- Junior gets penalties as free state but wins permanently if successful

**Inheritance gambles (active player strategy):**
- Marry heir to weak neighbor's only daughter, wait for father's death without male issue → inherit
- Risks: succession crisis wars, claim challenges, papal/imperial interference
- "Let others wage war, you marry" — Habsburg path

**Full integration:**
- 50 years stable + high loyalty + same religion + diplomacy investment
- Begin Integration decision, 25 more years to complete
- Junior absorbed into senior — provinces direct, cultures may need promotion, estates merge

**Dissolution:**
- Junior wins independence war
- Senior dies without matching heir
- Player abdicates voluntarily

### Casus Belli summary

(See Military section for full list)

### Spies and intrigue

Per-nation intrigue pool, monthly:
- **Fabricate Claim** (1 cost)
- **Sponsor Discontent** (2 cost)
- **Steal Tech** (2 cost)
- **Assassinate Character** (3 cost, era-flagged)
- **Forge Documents** (3 cost)
- **Sow Discord** (1 cost) — drop opinion between two foreign nations

Failure: detection drops opinion catastrophically, may trigger CBs against player.

### Era progression

**Medieval (1200–1450):** Envoys travel, marriage diplomacy primary, Pope as major actor, excommunication weaponized

**Renaissance (1450–1600):** Permanent embassies (Venice innovated, gets bonus), Diplomatic Corps unlocks, Reformation splits religious diplomacy

**Early Modern (1600–1800):** Westphalia, Balance of Power doctrine, colonial diplomacy

**Industrial (1800+):** Telegraph diplomacy, Concert of Europe, Spheres of Influence, nationalism reshapes legitimacy

---

## 8. System 4 — Dynasty & Royal Family

### 1200 hand-authored character database (~500 characters)

**Tier 1 nations** (top 10) — ~15 characters each:
ruler, spouse, 2–4 children, 1–3 siblings, cadet branch heads, notable claimants

**Tier 2 nations** (~20) — ~8 characters each

**Tier 3 nations** (~50) — ~3 characters each (ruler, spouse, eldest heir minimum)

**Notable starters:**
- **Philip II Augustus** (France, 35, Dip 18 Stew 15 Mar 14 Int 16 Lea 10 Pie 8, Patient/Cunning/Just; rival John of England)
- **John of England** (33, Dip 7 Stew 12 Mar 9 Int 14 Lea 11 Pie 6, Wroth/Greedy/Suspicious; succession instability)
- **Innocent III** (Pope, Dip 19 Stew 16 Lea 18 Pie 20, Patient/Just/Zealous/Reformer)
- **Temujin** (Mongol clans, ~38, Mar 24 Dip 17 Int 18, Brilliant Strategist/Ambitious/Charismatic; unification chain through ~1206)
- **al-Adil** (Ayyubid, capable; dynasty fragmentation risk)
- **Alexios III Angelos** (Byzantium, weak ruler flag; Fourth Crusade event chain primed)

**Sourcing:** Wikipedia infoboxes, Medieval Lands database (Cawley genealogy), best-effort procedural fill where records thin.

**Build approach:** content-entry tool built early (in-browser form writing JSON), CSV bulk import possible. Spans whole project lifecycle, not blocking code work. Stub characters acceptable mid-build.

### Character data model

```javascript
{
  id, dynasty_id, culture, religion,
  given_name, dynasty_name, nickname,
  birth_date, death_date,
  gender,

  stats: { diplomacy, stewardship, martial, intrigue, learning, piety },
  hidden_stats_until_age: 16,

  traits: [
    { trait_id, source: "born"|"inherited"|"educated"|"event"|"genetic",
      acquired_date }
  ],

  health: { current, max, conditions: [], plot_armor: false },
  fertility: { base, modifiers, sterile: false },

  family: {
    father_id, mother_id, spouse_id, ex_spouses: [],
    children: [], legitimate_children: [], bastards: [],
    siblings: [],
    dynasty_relationships: []
  },

  position: {
    location: province_id, title,
    court_role: null|"chancellor"|"marshal"|"spymaster"|"steward"|
                "court_chaplain"|"physician"|"court_intellectual",
    field_role: null|"general"|"admiral"|"governor",
    held_claims: [], inheritance_claims: []
  },

  status: {
    prestige, piety_score,
    plots_involved_in: [],
    education_focus, education_complete, tutor_id,
    regent_for, is_regent
  },

  genetic_pool: {
    common_ancestors: [],
    consanguinity_score: 0
  }
}
```

### Stats (0–25 each)

Diplomacy, Stewardship, Martial, Intrigue, Learning, Piety. Hidden until age 16.

**Ruler stats modify national parameters:**
- Diplomacy: opinion gain, alliance acceptance, peace deal effectiveness
- Stewardship: tax efficiency, building cost, estate management
- Martial: army morale, general slots, manpower regen
- Intrigue: spy effectiveness, plot detection, claim fabrication
- Learning: tech generation, institution adoption, advisor effectiveness
- Piety: religious unity, papal favor, missionary strength

### Traits (~120 pool)

- **Personality** (~30): Brave, Craven, Wroth, Patient, Just, Cruel, Kind, Greedy, Charitable, Honest, Deceitful, Loyal, Disloyal, Humble, Arrogant, Cynical, Trusting, Suspicious, Bold, Cautious, Ambitious, Content, Forgiving, Vengeful, Diligent, Slothful, Chaste, Lustful, Sociable, Reclusive
- **Skill** (~25): Brilliant Strategist, Drillmaster, Master Diplomat, Silver Tongue, Master Spy, Scholar, Mystic, Architect, Negotiator, Theologian, Mathematician, Naturalist, Poet, Hunter, Falconer, Jouster, Linguist, Cartographer, Astronomer, Alchemist, Engineer, Inventor, Reformer, Administrator, Tactician
- **Physical** (~20): Strong, Frail, Beautiful, Plain, Scarred, Lame, Tall, Short, Robust, Sickly, Genius, Slow, Fertile, Infertile, Hale, Disfigured, Hardy, Albino, Heterochromic, Twin
- **Health / Condition** (~15): Sickly, Diseased: Smallpox, Diseased: Plague, Wounded, Crippled, Stressed, Possessed, Lunatic, Mad, Depressed, Melancholic, Lovers Pox, Drunkard, Opium User (era-flagged), Gout
- **Education** (~10): Battle-Hardened, Educated at Court, Educated Abroad, Cloistered, Raised by Vassals, Captive, Self-Taught, Tutored by Master, Failed Education, Eternal Student
- **Faith** (~10): Zealous, Cynical, Pious, Heretical Sympathies, Pagan Sympathies, Crusader, Pilgrim, Heresiarch, Schismatic, Reformer-faith
- **Acquired** (~10): Conqueror, Lawgiver, Builder, Eccentric, Reformer, Tyrant, Magnificent, Wise Council, Friend of the Common Folk, Beloved

Inheritance: 25–40% pass-through. Genetic traits higher rates. Acquired never inherit.

### Education

**Milestones at ages 6, 10, 16.** Player assigns focus per child:
- Martial → may grant Brave/Reckless/Drillmaster
- Stewardship → may grant Diligent/Charitable
- Intrigue → may grant Cunning/Suspicious/Schemer
- Diplomatic → may grant Silver Tongue/Patient
- Learning → may grant Scholar/Mystic
- Piety → may grant Zealous/Cynical

Tutor stats influence trait gain. Focus locked by 16.

### Succession laws

- **Confederate Partition** — split among sons. Common 1200 default. Realm-shattering per generation unless reformed.
- **Elective** — nobility/electors choose. Stable nation, weak crown. HRE default.
- **Salic Primogeniture** — eldest son, women excluded.
- **Primogeniture** — eldest regardless of gender. Late unlock.
- **Seniority** — eldest dynasty member. Steppe/early Slavic.
- **Tanistry** — qualified candidate from dynasty. Celtic/Irish/steppe.

Reform unlocks gated by era + government + estate loyalty.

### Marriages

**Three simultaneous functions:**
1. **Diplomatic** — opinion bonus, alliance potential
2. **Genetic** — combines trait/stat pools for offspring
3. **Dynastic claim weaving** — children carry claims from both parents

**Strategic uses:**
- Marry eldest into powerful neighbor's family
- Marry for traits (Genius, Genius child chance)
- Marry for fertility (Lustful + Fertile)
- Marry for legitimacy (strengthen weak claim)

**Bastards** (Lustful trait or events):
- Hidden initially, may be discovered (scandal, opinion hit)
- Legitimize at cost (papal favor, decree, prestige hit)
- Legitimized bastards become full claimants
- Unlegitimized can be pretenders for enemies

### Inbreeding mechanics — full Habsburg system

**Consanguinity scoring per pair:**
- Siblings: 0.5 (catastrophic)
- First cousins: 0.125
- Second cousins: 0.03125
- Half-siblings: 0.25
- Uncle/niece: 0.25

**Marriage warnings** on high-kinship matches. Catholic Church forbids close consanguinity → papal dispensation required (gold + papal favor).

**Inherited inbreeding effects on children:**
- Sickly, Frail, Infertile, Slow, Melancholic, Mad, Deformed
- Rare positive: Genius (concentrated lineages occasionally produce exceptional)

**Stacking generations:** consanguinity accumulates. 4 generations of cousin marriages → short lives, ruling mads, infertile heirs. Habsburg collapse becomes mechanically reproducible.

**Genetic stacking caps:**
- Single positive trait has hard cap on consecutive generations before degrades
- 4-gen Genius lineage starts producing Eccentric or Mad alongside Genius
- Stacking same trait increases negative counterpart chance
- Inbreeding multiplies these effects
- Vigorous Blood modifier from cross-culture/religion/distant-dynasty marriages

### Cadet branches

Younger sons' descendants. Strategic uses:
- Marry into foreign royal families (spread dynasty)
- Cadet branch on foreign throne = massive prestige
- Score points at end of game
- Grant lands as vassals
- May rebel and claim main throne

**Dynasty View:** zoomable family tree across generations.

### Queens regnant, consort, mother

**Queens regnant:**
- Available under Primogeniture and Absolute Primogeniture
- Some cultures historical (Norse, Iberian, Asian)
- Play identically to kings — full agency
- Specific events: foreign marriage proposals (husband may carry claims, demand consort regency power), pregnancy mechanics, succession crisis if childless
- Era-decaying opinion penalty from some estates and foreign nations

**Queens consort:**
- Full stats/traits like everyone
- Can hold court role if stats fit
- Carry dynasty diplomatic ties
- Eleanor of Aquitaine-style influence: high-Dip + Patient queen can soften Wroth king
- Special events: champion causes (Zealous → push Crusade; Mercantile → push trade reforms; Cunning → run intrigue)

**Queen mothers:**
- Default regent candidates for minor sons
- Continue wielding influence after regency
- May favor certain children
- Blanche of Castile, Olga of Kiev, Empress Wu prototype

### Regencies

Triggered when ruler under 16.

**Regent options ranked:** queen mother (highest claim), senior royal uncle, senior councilor, powerful noble vassal, council of nobles. Player chooses at regency formation.

**Regent has own stats/traits/ambitions.** Affects realm during regency.

**Regent loyalty score** — risk of seizing throne or extending regency past majority. High-Diplomacy regents stabilize; high-Intrigue may plot.

**Ends:** age 16, regent death, event chain. Long regencies create instability — Nobility gains influence, foreign powers see weakness.

### Court positions

- **Chancellor** (Diplomacy)
- **Steward** (Stewardship)
- **Marshal** (Martial)
- **Spymaster** (Intrigue)
- **Court Chaplain** (Piety / Learning)
- **Court Physician** (later era — health for family)
- **Court Intellectual(s)** (Learning, specialty: Theologian, Astronomer, Philosopher, Poet, Mathematician, Engineer, Historian)

Filling positions: estate loyalty bonus.

### Court intrigue and plots

**Plot mechanics:**
- Hidden objectives some characters pursue (seize throne, gain independence, replace chancellor, assassinate heir)
- Detection scaled to Intrigue + Spymaster
- Detected: prosecute (imprison/execute), suppress (warning), or turn (become backer)
- Undetected → fires as event

**Foreign intrigue:**
- Sponsor pretenders
- Assassinate foreign rulers (era-flagged, prestige + opinion costs)

### Ruler death

**Pause-and-acknowledge event sequence:**
1. Mourning notification + funeral event
2. Succession resolution
3. Possible succession crisis (Pretender War)
4. Personal Union check
5. New ruler introduction
6. Estate response (revalued loyalty based on new traits)
7. Foreign opinion shift

### Realistic medieval mortality

**Infant/child mortality (1200 baseline):**
- ~30% before age 5
- ~15% additional ages 5–15
- Drops over eras: 25% (1500), 15% (1800), 8% (1900)

**Adult mortality:**
- Random natural-death rolls increase with age
- Average male lifespan if reaching adulthood: ~50 years (1200), improving
- Combat deaths for active generals
- Childbirth deaths: 8–12% per childbirth (1200), declining
- Disease/plague: ~20–30% mortality in epidemic regions

**Plague event chain (1346–1353 Black Death):**
- Scripted historical, catastrophic Eurasian population loss
- Royal families take massive hits — succession crises everywhere
- Triggers Peasant labor-leverage events (Demands for Land/Wages)

**Health system:**
- 0–100 per character
- Drains with age, injuries, stress, plague exposure, inbreeding
- Restored slowly with rest; faster with Court Physician (era-locked)
- Below 25: bedridden, can't lead armies or hold court roles
- Below 5: imminent death event

**Plot armor for historical figures:**
- Highly-protected during historical reign window
- Genghis Khan can't die in 1206 from hunting accident — unification chain has armor through historical death window
- Philip II Augustus has armor until historical death range
- Once window expires, full mortality applies
- Prevents first-50-year history going off rails before player divergence

### AI court simulation — full but tiered

All 80 nations run real court simulation:

**Daily/monthly tick (all):** aging, health, active war/event effects

**Quarterly tick (player + Tier 1+2 nations, lighter for Tier 3):**
- Court reassignments
- Marriage opportunities evaluated
- Plots progress
- Education focus decisions

**Annual tick (all):**
- Marriage executions
- Plot resolutions
- Health/age major events
- Estate loyalty recalc from court composition

**Event-triggered (any):**
- Ruler death (always full simulation)
- Childbirth (always full)
- Major war declaration
- Plot detection or firing

**AI decision-making:** weighted random from valid options by personality. Cached personality vectors per character.

### Dynasty View (iPad UX)

**Three view modes:**
1. **Family Tree View** — vertical generations, current ruler top, traditional tree downward. Pinch zoom; horizontal scroll within a generation.
2. **Court View** — current ruler's household, spouse, children, siblings, court positions filled. Day-to-day operational view.
3. **Dynasty Map View** — markers on every province ruled by your dynasty (direct or cadet). "Habsburg dream" visualizer.

**Profile drawer:** portrait (placeholder/AI-gen later), name/age/title/location, stats with modifier breakdown, traits with sources, family relationships (clickable), held claims, available actions, health, recent events.

**Royal Court visualization:** throne-room metaphor, ruler at center, court positions arranged around with character cards, empty positions show vacant prompts, dotted lines connect family, active plots glow subtly.

---

## 9. System 5 — Tech & Cultural Development

### Five tech trees

**1. Administrative**
- Land Survey, Treasury Management, Provincial Administration, Standardized Coinage, Tax Reform, Census Methods, Cadastral Records, Paper Currency, Civil Service Examination, Bureaucracy, Banking Reform, Universal Education, Modern Accounting
- Unlocks: tax buildings, government reforms, max province cap, institution adoption, estate management reforms
- Driven by: Stewardship, Steward role, Burgher/Clergy influence, banks/marketplaces/courts

**2. Military**
- Iron Stirrup, Composite Bow, Trebuchet, Crossbow Production, Plate Armor, Pike Formations, Star Fort Engineering, Gunpowder Refinement, Drill Manuals, Standing Army Doctrine, Naval Tactics, Field Artillery, Conscription Reform, Combined Arms, Industrial Warfare, Railroad Logistics
- Unlocks: unit types, fortification tiers, combat width, manpower efficiency, ships
- Driven by: Martial, Marshal role, Nobility influence (medieval), barracks/training grounds/arsenals

**3. Diplomatic**
- Heralds & Envoys, Codified Treaties, Embassy Networks, Permanent Ambassadors, Espionage Networks, Spy Bureaus, Diplomatic Protocol, International Law, Telegraphic Diplomacy, Intelligence Services
- Unlocks: diplomatic slots, espionage capacity, alliance management, treaty types, AI opinion thresholds
- Driven by: Diplomacy, Chancellor + Spymaster roles, Burgher influence, embassies/spy networks

**4. Cultural**
- Vernacular Literacy, Scholastic Method, Cathedral Schools, University System, Cartography, Printing Mass-Production, Vernacular Bible, Patronage of the Arts, Scientific Method, Salons, Public Libraries, Mass Literacy, Industrial Science, Public Education
- Unlocks: universities, cultural buildings, patronage mechanics, soft-power influence, tech sharing, refugee absorption bonus
- Driven by: Learning, Court Chaplain + Court Intellectuals, Burgher + Clergy influence, universities/libraries/theatres/academies

**5. Religious**
- Cathedral Schools (shared), Monastic Reform, Canon Law, Theology, Religious Orders, Inquisition Doctrine, Doctrinal Refinement, Vernacular Liturgy, Ecumenicism, Secular Theology
- Unlocks: missionary strength, doctrines (nation-wide modifiers), religious building tiers, papal favor capacity, religious league formation
- Driven by: Piety, Court Chaplain, Clergy influence, monasteries/cathedrals/madrasas/temples

### Dampened ruler swing

```
Monthly tech (per tree) =
    Base 40% (buildings + estates + institutions)
  + Court Contribution 30% (court roles assigned)
  + Ruler Stat Contribution 30% (capped)
```

Genius 25-Learning ruler can't generate more than 30% alone. Slow 4-Learning gets ~10% floor.

Bad rulers can be mitigated by great Court Chaplain, skilled Marshal, institutional momentum.

### Institutions

**Already adopted globally at 1200:** Feudalism

**To spawn during gameplay:**
- **New World** (1450+, requires Americas reached) — colonial expansion
- **Printing Press** (~1440 spawn Mainz-equivalent) — tech boost, religious diversity, literacy
- **Global Trade** (~1500) — naval/colonial economy, trade node value
- **Manufactories** (~1650+) — production transformation, urbanization
- **Enlightenment** (~1700+) — Progressive pressure, secularization, scientific method
- **Industrialization** (~1800+) — mass production, conscription, telegraph

### Institution spread mechanics

**General model:** Starts at spawn (100%), spreads to neighbors monthly. Per-institution base spread chance.

**Modifiers per neighbor:**
- Shared border ×1.5, naval connection ×0.7
- Same religion ×1.3, different ×0.7
- Same culture ×1.5, different ×0.6
- Source Cultural Influence ×up to 2.0
- Trade route between source/target ×1.3
- Target ideology: Progressive ×1.5, Traditional ×0.5, Open ×1.3, Isolationist ×0.5
- Target tech level (catch-up bonus)
- Distance latency

**Approximate timelines:**
- Printing Press 1440 spawn: Germany 10 years, Catholic Europe 30, Orthodox/Islamic 50–80, East Asia 80+
- Global Trade 1500: Iberian/Italian Mediterranean by 1520, North Sea/Baltic by 1540, Indian Ocean by 1560, full Asia by 1600
- Enlightenment ~1700: Paris/London/Amsterdam spawn; slow through Catholic, faster through Protestant; late Russia/Ottoman; may never fully reach Theocratic strongholds
- Industrialization ~1800: Britain spawn; via trade routes, faster to allied/culturally-close; East Asia adopts late; some regions don't industrialize until 1900+

### Institution adoption

Each nation tracks % institution present in provinces. At 50% threshold, **embrace** action available:
- Permanent national bonuses
- Halts "behind times" penalty
- Unlocks era decisions/reforms
- Sets ideology pressure

### Forced divergence — behind-era penalties

Era expectation matrix per era (Admin 8 + Military 7 + Cultural 6 etc. by 1500).

**Behind-era nations face:**
- 5% tech generation reduction per era-level behind, stacking
- Institution adoption blocked until reach previous-era minimum
- Reform actions cost double
- Estate loyalty drops if behind for 50+ years
- Coalition Threat increase for advanced neighbors

**Catch-up paths (active):**
1. Refugee/scholar absorption (cheapest, event-based)
2. Reform program (gold + admin + time + political cost)
3. Allied tech sharing (slow)
4. Conquest of advanced provinces (steppe-style)
5. Espionage tech theft (slow, risky)

### Steppe tech absorption

**Pragmatic Conqueror bonus:**
- Steppe-flagged nation conquering higher-tech province for 5+ years gets one-time tech transfer
- Transfer = 25% of tech gap
- Steppe nations also adopt foreign institutions slightly faster
- Lost after sedentary government reform

**Historical analogue:**
- Mongol expansion (1206+ chain): conquest of Khwarazm, China, Persia delivers tech jumps
- Cumans, Pechenegs, Manchus, Crimean Tatars also get bonus
- Not dominant — can't tech-steal to Industrial Britain

### Cultural Influence — active layer

**Cultural Influence score (0–10,000):** monthly generation from cultural buildings, court intellectuals, patronage actions, hosting cultural events. Spreads through trade nodes, embassies, royal marriages, prestige events.

**Patronage actions:**
- **Commission a Work** — pay an artist/architect/scholar for output: painting, sculpture, treatise, palace addition, monument. Cost: gold + influence slot 1–5 years. Returns: influence boost, prestige, sometimes new tech, occasionally a "Renowned Work" — permanent national landmark on map.
- **Patronize a School of Thought** — Florentine Humanism, Persian Astronomy, Song Neo-Confucianism, Baghdad House of Wisdom analogues. 10–30 year duration. Produces tech + influence consistently. May shift ideology.
- **Host a Council/Symposium** — gather scholars/clerics from across the world. Big gold + diplomatic cost. Produces tech boost, prestige spike, possible major events. Diet of Worms, Council of Trent, Mughal religious debates analogues.

**Court Intellectuals (new court role):**
- Optional court position (1, 2, or 3 by era + buildings)
- Specialty: Theologian, Astronomer, Philosopher, Poet, Mathematician, Engineer, Historian
- Recruit from own dynasty/citizens or attract from foreign courts (gold + prestige)
- Generate Cultural/Religious tech or specific bonuses
- Foreign-recruited Intellectuals carry origin's cultural goods (Avicenna to your court = Persian medical knowledge transfer)

**Foreign University Sponsorship:**
- Spend gold to fund universities/scholars in foreign nations
- Decades long
- Your cultural ideas spread; their elite-educated children may be sympathetic (event opportunities)

**Cultural Influence effects:**
- **Soft Power** opinion bonus with everyone
- **Ideological Pull** on bordering nations
- **Renowned Works** = permanent map landmarks, ongoing income + prestige
- **Cultural Hegemony** unlocks Cultural Conquest victory path

### Cultural conversion of provinces — full system

**Mismatch consequences (immediate, ongoing):**
- Tax efficiency 60% of normal
- Manpower yield 50%
- Unrest baseline +3
- Cultural Influence drain
- Estate loyalty hits
- Foreign opinion penalty from same-culture nations

**Three approaches:**

**1. Accept the mismatch** — live with penalties forever. Passive cultural drift (50+ years) may partially reduce. Cheapest, riskiest long-term.

**2. Cultural Promotion (integration path)** — spend admin + gold continuously, 10–40 years depending on:
- Cultural distance
- Province development (urban slower, rural faster)
- Player Cultural Influence
- Religion match
- Buildings present (universities slow it ironically)

During conversion: ongoing unrest events, foreign powers may sponsor pretenders. After success: native treatment, full efficiency, loyalty bonus.

**3. Cultural Tolerance Reform** — government reform accepting diversity as identity (unlocks Cosmopolitan archetype). Reduces mismatch penalties significantly. Costs: ideology shift Progressive + Federalist + Open. Limits some nationalism mechanics later.

**Cultures that resist harder:**
- Religious-bound when religions also mismatch
- Urban high-development with universities (educated populations preserve identity)
- Diaspora cultures (Jewish, Armenian, etc.) — never assimilate (see Religion section for expulsion mechanics)

**Integration arc** as game content: most historical kingdoms spent 200+ years culturally integrating. Annexed Aquitaine 1230 finally Frenchifies 1390 with revolts, breakaway moments, eventual full integration.

### Government reforms

**Main tree:**
Feudal Monarchy → Administrative Monarchy → Absolute Monarchy → Constitutional Monarchy → Parliamentary Republic / Revolutionary Republic / Modern Constitutional Monarchy

**Side branches:**
- Theocracy (Religious tech intensive)
- Merchant Republic (Burgher influence)
- Tribal Federation → Settled Khanate → Reformed Empire (steppe)
- **Multi-Cultural Empire** (Cultural intensive, Open + Federalist required)
- Bureaucratic Empire (Admin intensive, Confucian-style)

### Tech tree visualization (iPad)

Five trees as horizontal scrollable strips on single screen:
- Each tree own scrollable row
- Visible: current + next 1–2 + completed past 1–2 per tree
- Vertical scroll switches focus tree
- Tap node for details
- Locked/available/unlocked/in-progress indicators
- Progress bar accumulated/threshold

**Era markers** on trees + behind-era nodes grey-tinted, ahead-of-era gold-glow.

**Era Dashboard** screen: one-screen overview tech progress all 5 trees vs. era expectations. Pending institutions + spread status worldwide minimap.

---

## 10. System 6 — Religion

### Faiths at 1200 (~20 faiths, ~40 doctrinal variants)

- **Catholic** — France, England, HRE, Iberian Christian, Italian, Crusader, Poland, Hungary, Scandinavia, Ireland
- **Orthodox** — Byzantine remnants, Bulgaria, Serbia, Kievan Rus, Georgia, Armenian (Miaphysite)
- **Coptic / Ethiopian Christian** — Ethiopia, Nubia, Coptic Egypt
- **Sunni Islam** — Ayyubid, Abbasid rump, Khwarazm, Seljuk Rum, Almohad/Almoravid, Mali (forming), Kanem
- **Shia Islam** (Twelver, Ismaili, Zaidi) — Fatimid remnants, Persian/Iraqi pockets, Yemen
- **Hindu** — South India (Chola, Pandya, Hoysala), Sri Lanka mixed
- **Buddhist** — Mahayana (East Asia), Theravada (Pagan, Khmer transition), Vajrayana (Tibet, parts of Mongolia)
- **Confucian / Syncretic East Asian** — Song, Jin, Goryeo, Kamakura
- **Shinto / Folk Japanese** — alongside Buddhism in Japan
- **Tengri** — Mongol clans, steppe
- **Norse / Baltic Paganism** — small Baltic/Karelia/Sami pockets
- **African Traditional Religions** — varies by region
- **Zoroastrian** — Persian/Iraqi remnant
- **Jewish** — diaspora communities, no state, present in many provinces
- **Manichean / Other Late Antique** — small surviving pockets

### Religious heads as full characters

**The Pope:**
- 1200 hand-authored: Innocent III (Dip 19 Stew 16 Lea 18 Pie 20, Patient/Just/Zealous/Reformer)
- Full character with own ambitions, rivals, age, health
- Ambitions: "Strengthen Papal authority over Christian kings," "Successful Crusade," "Suppress Cathar heresy," "Reform the Church"
- Rivals: HRE Emperor (investiture struggle)

**Papal conclave on death:**
- All Cardinals (~20–30 high-Clergy characters from Catholic nations) gather
- Multiple candidates with backers
- Catholic nations spend gold/prestige/diplomatic effort to influence
- Cardinal factions: Pro-Imperial, Pro-French, Reformist, Traditionalist, Italian Aristocracy
- Player can promote characters into Cardinal pool, maneuver to papal throne — winning Papacy is multi-generational play

**Sunni Caliph:**
- An-Nasir 1200 (Abbasid, real ruler 1180–1225)
- Caliphate Authority score
- **1258 Baghdad sack** historically destroys Abbasid Caliphate; **Caliphate Claim becomes contestable** post-1258 (Mamluks shadow caliphate, Ottomans 1517+)

**Orthodox Patriarchs:**
- Patriarch of Constantinople (highest 1200)
- Patriarchs of Antioch, Alexandria, Jerusalem (under Crusader occupation 1200)
- Patriarch of Moscow appears via Third Rome event chain post-1589
- 1453 Constantinople fall → Patriarch becomes Ottoman political subject

**Shia leadership:** Twelver in occultation, religious authority distributed among Marja in Najaf/Karbala/Qom area

**Buddhist Sangha leaders, Hindu Acharyas/Mahants/Sankaracharyas** — regional characters, less centralized

**Mechanical effect:**
- Religious heads have ambitions shaping diplomacy
- Personalities create distinct eras (Innocent III era ≠ Boniface VIII era)
- Deaths/successions = major events
- Players interact via diplomacy: lobby, bribe, threaten, sponsor candidates

### Personal religious conversion for rulers

**Reasons:**
- Marriage to foreign royal of different faith
- Pragmatic political need ("Paris is worth a Mass")
- Genuine religious experience (event)
- Pressure from estates/foreign powers
- New ideology archetype
- Conquest by different-faith power (forced)

**Two paths:**

**1. Quiet Conversion (personal only):**
- Ruler converts, state religion remains
- Personal piety vs national religion tension activated
- Clergy estate of old religion deeply unhappy (loyalty crash)
- Foreign powers of new religion friendlier
- Heirs may be raised in new faith — planning long-term shift
- May trigger civil war if estates revolt

**2. Royal Reformation (convert the realm):**
- Catastrophic short-term: rebel armies, foreign Holy Wars, estate revolts en masse
- Survive 20–30 years → realm religion finalizes
- Religious unity to zero then climbs over decades
- Henry VIII Anglican break, Sweden's Reformation under Gustav Vasa, Brandenburg Calvinist Hohenzollerns

### Religious tolerance — sliding scale (0–100)

**Tolerance 0 (Fully Intolerant):**
- Forced conversion of conquered
- Active persecution
- Mismatched provinces unrest +8
- Refugees flee
- Religious leagues love you
- Different-faith nations hate
- Inquisition doctrine bonuses

**Tolerance 30 (Pragmatically Intolerant):**
- State religion privileged, others tolerated within limits
- Moderate penalties
- Heretics suppressed not persecuted

**Tolerance 50 (Plural):**
- Multiple faiths allowed
- Minor penalties on mismatched
- Full tax/manpower from non-state-religion provinces
- Polish-Lithuanian Commonwealth, medieval Sicily under Roger II

**Tolerance 80+ (Fully Tolerant):**
- All faiths protected
- Religious tech reduced
- Cultural tech boosted
- Religious leagues distrust; Cultural Influence soars
- Refugees flock
- Mongol religious tolerance, Ottoman millet, late-medieval Cordoba convivencia

**Set by:** government type, ruler traits (Zealous lowers, Just/Cynical raises), estate composition, ideology, events, direct reform decisions.

**Affects:** conversion speed, unrest, foreign opinion, refugee attraction, religious vs cultural tech tradeoff, foreign-merchant trade bonuses.

### Religious leadership claims

**Defender of the Faith (any major faith):**
- Highest-status nation of faith claims
- Requirements: high prestige, leading nation by development, recent successful war for faith
- Benefits: +25 prestige, opinion bonus same-faith, lead religious league, religious head favor bonus
- Contested: only one per faith; another can challenge
- Loss: lose major war, religious unity drops, lose pilgrimage city

**Caliphate Claim (Sunni):**
- Post-1258 contestable
- Requirements: hold Mecca + Medina, win wars against non-Muslim powers, high religious unity, leading Sunni by development
- Become Caliph (institution): +50 prestige, all Sunni nations opinion bonus, religious head powers

**Third Rome (Orthodox):**
- Post-1453
- Available to leading Orthodox nation: requires Orthodox state religion, leading Orthodox by development, religious unity above 70
- De facto Orthodox religious head, +prestige, Orthodox patriarchate moves to your capital
- Contested (Bulgaria attempted, Serbia attempted historically)

**Imperial Faith Patron (HRE):**
- Defender role over Catholic territories within Empire
- Tensions with Pope baked in

**Hindu Chakravartin / Buddhist Cakravartin:**
- Universal Sovereign claim for dominant Hindu/Buddhist nations
- Requirements: major holy sites, dominant power in region, ruler Devout
- Benefits: religious head powers for that faith, prestige, cultural authority

**Khan of Khans (Mongol/steppe):**
- Genghis successor claim
- Distinct from religious authority but similar function

### Religious civil wars and sect-vs-sect

**Religious Civil War (intra-nation):**
- Low religious unity + significant heretic population + Clergy revolt or ruler conversion
- Splits nation: state-religion provinces loyal, dissenters form Pretender state
- Each side gets armies based on provinces' manpower
- Outcomes: state religion wins (forced conversion + massive unrest decades), dissenters win (state religion changes OR nation splits), negotiated (tolerance enforced, both faiths legalized)
- French Wars of Religion (1562–1598), Schmalkaldic War, English Civil War religious dimension, Glorious Revolution

**Religious League War:**
- Same broad faith, different doctrines
- "War of Religious Doctrine" CB
- Religious leagues auto-participate, conversion of provinces = war goal
- Religious head may directly intervene

**Heresy Suppression War:**
- Distinct CB: cheaper AE, religious head approval boost, forced reconversion
- Failure: heresy spreads faster after, prestige crash
- Albigensian Crusade (1209–1229, scripted at game start), Hussite Wars

**Sect vs Sect:**
- Sunni vs Shia: "Doctrinal Reclamation" CB
- Catholic vs Orthodox: "Reunion of the Churches" CB (Fourth Crusade prototype)
- Mahayana vs Theravada (rarer, geographic separation)

**Crusade (special tier, era-flagged):**
- Pope-called multi-nation, 1095–1400 window
- Stacks bonuses: cheaper AE, prestige rewards, faith spread
- Reverse Crusade ("Counter-Crusade" / Reconquista / Jihad)

### Personal piety vs national religion tensions

**Personal piety score per ruler (0–100):** set by traits, education, dynasty background. Modified by traits acquired, events, age (often drifts higher).

**Alignment cases:**

**High piety + state religion match:** all bonuses normal, no tensions

**Low piety in high-unity nation:**
- Clergy distrusts
- Religious decisions slower to commit
- Religious head opinion lower
- Heretic events fire more
- May secularize early

**High piety in secular/tolerant nation:**
- Ruler pushes stronger religious decisions
- Clergy gains influence under this ruler
- Tolerance drifts down during reign
- Foreign co-religionist opinion higher
- Heretic suppression events fire more

**Different personal religion than state religion:**
- Quiet Conversion consequences activate continuously
- Hidden agendas (convert courtiers, marry heir to different-faith partner)
- Periodic events offering to declare conversion
- Clergy eventually catches on → forced crisis
- Henry of Navarre as Huguenot king of Catholic France pre-conversion

### Heresy spawn conditions

- **Cathar/Albigensian:** active 1200, Albigensian Crusade fires 1209
- **Waldensian:** active 1200, survives Alpine valleys
- **Hussite:** ~1380s Bohemia (low Papal Authority + reformer Czech ruler + Cathedral Schools tech)
- **Lollardy:** ~1380s England (conditions met, generally suppressed)
- **Reformation Lutheran:** ~1517 HRE (Printing Press + low Papal Authority + Reformer-trait HRE ruler + Cultural tech + Indulgence chain)
- **Reformation Reformed:** ~1540s Geneva/Swiss (Lutheran already spawned + further conditions)
- **Anglican:** ~1530s England (Pope dispute + Reformer or Lustful trait + parliament influence)
- **Counter-Reformation:** doctrine reform option post-Reformation Catholic
- **Wahhabi-equivalent:** ~1700s+ (low Caliphate Authority + specific Arabian conditions)
- **Buddhist Pure Land, Zen variants in Japan** — event chains

### Sub-Saharan religious dynamics

**1200 starting:**
- Mali: rulers Islamic, peasantry mostly Traditional
- Kanem: Islamic ruling class
- Ethiopia: Christian (Coptic/Miaphysite)
- Most West/Central/Southern Africa: Traditional

**Islamic mission spread:**
- Trans-Saharan trade routes carry Islam south
- Trade node control of Sahel nodes accelerates
- Sufi orders particularly effective at peaceful conversion
- Wealthy ruling classes convert first, peasantry follows over centuries

**Christian mission spread (~1450+):**
- European exploration era starts Christian missionary expansion
- Portuguese-equivalent reach to Kongo, Ethiopia connection strengthens
- Jesuit missions (Counter-Reformation) accelerate Catholic
- Protestant missions (1700s+) competing wave

**Resistance:** Many ATR-aligned populations high resistance. Some kingdoms retain traditional deep into game (Asante, Dahomey, Zulu historical analogues).

**Syncretism mechanic:** when religion converts, resulting practice may be syncretic — counts as new religion but bonus events fire reflecting syncretic blend.

### Pilgrimage and shrines

Pilgrimage cities generate ongoing income + Religious tech bonus + prestige. Holding/losing them is massive.

- **Catholic:** Rome, Santiago de Compostela, Canterbury, Jerusalem (if Christian), Cologne
- **Orthodox:** Constantinople (Hagia Sophia), Athos, Kiev (Pechersk Lavra)
- **Sunni:** Mecca, Medina, Jerusalem (Al-Aqsa)
- **Shia:** Karbala, Najaf, Mashhad, Qom
- **Hindu:** Varanasi, Rameshwaram, Puri, Tirupati, Char Dham
- **Buddhist:** Bodh Gaya, Lumbini, Sarnath, Mount Kailash, Borobudur
- **East Asian:** Mount Tai, Mount Wutai, Ise Shrine

### Religious unity per nation

Modified by % provinces of state religion, % rulers historically of state religion (legacy modifier), missionary efforts, religious league membership.

- High (>80): +tax, +manpower, +stability, +loyalty estates of state religion
- Low (<40): heretic events, unrest baseline rises, conversion difficulty, foreign religious war ammunition

### Late-game secularization

Reform path available starting late Early Modern (~1700+):
- Costs gold + Cultural tech + Progressive ideology
- Effects: religious unity less mechanically significant, Cultural tech increased, religious estates lose privileges, heretic provinces no longer unrest, different-religion mismatch reduced, Cosmopolitan reform unlocks
- Ideology shifts hard Secular + Progressive
- Religious estate loyalty crashes initially; long-term pays off
- French Revolution-style, Meiji-era Shinto restructuring, Atatürk-style modernization

---

## 11. System 7 — Internal Politics & Estates

### Estate composition templates

Each nation has data-defined estate template by government + culture.

**Templates:**

**Western European Feudal:**
- Nobility (35–45% land, high)
- Catholic Clergy (15–25%, high)
- Burghers (5–15%, medium; higher trade regions)
- Peasants (no land share, baseline pop, low influence at 1200, mechanical agency)
- Optional Jewish diaspora (no land, minor)

**Italian/Hanseatic Merchant Republic:**
- Burghers (50–65%, dominate)
- Patrician Nobility (15–25%, subordinate)
- Catholic Clergy (10–15%)
- Peasants (rural hinterland only)
- Diaspora often influential

**Byzantine/Orthodox Imperial:**
- Orthodox Clergy (20–30%, very high — historically powerful)
- Nobility (30–40%)
- Burghers (10–20%, dominant in Constantinople specifically)
- Peasants (active)
- Diaspora: Armenians + Jews in trade centers

**Eastern Slavic (Kievan Rus successors):**
- Boyars (Slavic Nobility variant, 35–45%)
- Orthodox Clergy (15–25%)
- Veche Burghers (Slavic urban; Novgorod high Veche influence)
- Peasants (active, more independence than W European)

**Crusader States:**
- Crusader Nobility (specialized, fortress-focused, low loyalty baseline)
- Catholic Clergy (high — religiously charged)
- Italian Merchant Burghers (Venetian/Genoese enclaves, 15–25%, mostly autonomous)
- Native Christians (Syriac/Maronite/Armenian, distinct from Catholic Clergy)
- Native Muslim Population (subject estate)
- Peasants (mixed religion)

**Sunni Islamic Sultanate (Ayyubid, Khwarazm, Seljuk, Almohad, Delhi):**
- Sunni Ulema/Clergy (20–30%)
- Mamluk/Ghulam Military Caste (slave-soldier estate, 15–25% in Mamluk-system states)
- Tribal Nobility / Emirs (15–25%)
- Burghers (15–20%, important Cairo, Aleppo, Samarkand)
- Peasants/Fellahin (active)
- Dhimmi communities (Christian, Jewish — protected minority estate, specific tax obligations, limited political rights, full economic activity)

**Shia Islamic State:**
- Shia Ulema (20–25%, distinct from Sunni structure)
- Other estates similar to Sunni

**Imperial Bureaucratic (Song, Jin, Goryeo, post-Heian Japan limited form):**
- Bureaucratic Scholar-Officials (40–55%, dominant via exam)
- Buddhist/Daoist Clergy (10–20%)
- Aristocratic Clans / Old Nobility (15–25%, varies — Song reduced, Jin elevated by Jurchen tribal elite)
- Merchant Burghers (10–15%, grew over centuries)
- Peasants (active — Confucian theory respects them)
- Special Japan: Samurai estate (military caste, dominant under Kamakura)

**Hindu State (Chola, Pandya, Hoysala):**
- Brahmin Priestly Caste (15–25%)
- Kshatriya Warrior Nobility (30–40%)
- Vaishya Merchant Caste (10–20%)
- Shudra Peasant/Worker Caste (active)
- Outside-caste communities (Dalits in concept, regionally distinct)
- Diaspora: Persian traders, occasional Arab Islamic merchants in coastal cities

**Buddhist State (Khmer, Pagan, Sukhothai forerunners, Theravada Sri Lanka):**
- Sangha (Buddhist Clergy, 20–30%, very high)
- Royal Nobility / Princes (25–35%)
- Burghers (10–15%)
- Peasants (active)

**Steppe Tribal Federation:**
- Tribes (50–70%, dominant)
- Tribal Aristocracy / Noyans (15–25%)
- Tengri Clergy (10–15%)
- No Burghers (caravan merchants mobile)
- No Peasants typically (pastoralists)
- Tributary Settled Populations (subject estate when ruling settled regions)

**Sub-Saharan Tribal/Empire (Mali, Kanem, Songhai-precursor, Ethiopia):**
- Tribal Nobility / Clan Heads (30–45%)
- Islamic/Christian Clergy (10–20% depending)
- Trade Burghers (10–20%, Sahel trade cities)
- Peasants/Pastoralists (active)
- Subject Tribes (in larger empires)

**Norse / Northern Tribal:**
- Jarl Nobility (30–40%)
- Christian Clergy (recently converted, 15–20%)
- Town-Dwelling Free Men (Burgher equivalent, 10–15%)
- Free Peasant-Warriors (armed, politically active)
- Pagan Holdouts (transitioning states, minor)

### Per-estate tracking

**Loyalty (0–100):**
- High (>75): bonuses to domain, no rebellions, helpful events
- Medium (40–60): functional, no bonuses
- Low (<30): demands, refusing royal requests, rebellion preparation
- Below 10: rebellion fires

**Influence (0–100, summing to 100 + Crown):**
- High: dominates court, can veto reforms, demands constant accommodation
- Low: marginalized, doesn't shape policy

**Land holdings (%):**
- Province-level ownership share
- Cuts province income before treasury
- Drifts based on reforms, conquests, decisions, events
- Can be seized/granted

**Privileges (0–6 granted):**
- Per-estate list of available privileges
- Granting: +loyalty, +influence to that estate
- Examples Nobility: Hereditary Titles (+manpower, succession stability), Tax Exemption (Crown hit, big loyalty), Court Monopoly (Nobility-only court candidates)
- Revoking: -loyalty, prestige hit, possible immediate revolt

### Influence math (zero-sum within nation, sums to 100)

**Default distribution:**
- Western European Feudal: Crown 25, Nobility 30, Clergy 25, Burghers 15, Peasants 5
- Merchant Republic: Crown 10, Burghers 55, Nobility 15, Clergy 10, Peasants 10
- Imperial Bureaucratic: Crown 30, Bureaucrats 35, Clergy 10, Nobility 15, Peasants 10
- Tribal Federation: Crown 15, Tribes 50, Tribal Nobility 20, Clergy 10, Peasants 5

**Shifts via:**
- Granting privilege: +5 to that estate, -1 from others (capped zero)
- Revoking: opposite
- Major events: ad hoc shifts
- Government reforms: re-baseline
- Successful rebellion: shifts revolting estate up significantly

**Crown influence:** your direct decision capacity without estate veto. High = autocratic; low = constrained. Reforms shift Crown up over centuries.

### Peasants as active estate at 1200

**Mechanical agency despite political marginality:**

**Affects:**
- Manpower regen in their provinces
- Tax efficiency (high loyalty = lower resistance)
- Recruitment events (well-treated = volunteers)
- Stability baseline

**Demand triggers:**
- Harvest failure: lower taxes
- Foreign invasion ravaging lands: peace + recovery aid
- Plague hits province: religious response
- Long famine cycles: reform or revolt

**Peasant Revolts (medieval):**
- Spawns rebel army in oppressed peasant provinces
- Size: oppression × time × province development
- Crushing: short-term, refills oppression meter, recurs
- Concession: lower taxes / reform / Peasants privilege (massive Nobility loyalty hit)
- **Historical analogues:** Stedinger revolts, French Jacquerie (1358), English Peasants' Revolt (1381), German Peasants' War (1524), various Russian rebellions

**Peasant influence growth:**
- Medieval: 10–20 baseline
- Renaissance: 15–25
- Early Modern: 20–30
- Industrial: transitions to "Working Class" / "Voters" — massive influence as franchise expands

**Peasant-specific events (~25 total):**
- Bread Riots, Wat Tyler-style folk hero, Pilgrim Crowds, Land Reform Demand, Tax Strike, Peasants' Charter, Folk Religion Resurgence, Mass Migration, Volunteer Levy, Reformer Priest (Lollard/Hussite precursors), Children's Crusade (1212 chain), Famine Migration, **Black Death Wage-Leverage** (post-1346, peasants demand more in labor-scarce regions — proto-modern labor arrangements, slow shift toward yeoman/wage-labor mix, eventual Burgher pathway), Plague Survivors Demand Wages

### Diaspora estates — full modeling

**Sensitivity note:** Diaspora communities are full estates with mechanical seriousness, treated with historical accuracy. Pogroms, expulsions, and forced conversions are real history the game does not flinch from but does not handle gratuitously. Mechanics reward tolerance and punish persecution (which is both morally right and historically accurate — expelling Jews/Sephardim crippled Spain, welcoming them enriched Netherlands and Ottoman).

**Diaspora estates at 1200:**

**Jewish communities** — many European, North African, Middle Eastern, some Central Asian provinces:
- No land holdings (legally barred most jurisdictions)
- +tax in their provinces (heavily taxed by lords)
- +Cultural tech, +Diplomatic tech (literacy, financial knowledge, scholarly traditions)
- +trade node activity (medieval Jewish trade networks)
- Own loyalty score
- Religious institutions: synagogues, yeshivot

**Armenian communities** — Byzantine, Crusader, Caucasus, some Anatolian:
- Limited land holdings in some Caucasus regions
- +trade, +Diplomatic tech
- Middleman roles in long-distance trade

**Sogdian / Central Asian Trader Networks** — Silk Road provinces:
- No land, mobile trader community
- Strong trade node bonuses
- Decline post-Mongol disruption

**Greek Diaspora** — Mediterranean trade ports after Byzantine setbacks

**Indian merchant communities (Tamil Chettiars, Gujarati Banias)** — Indian Ocean trade

**Coptic / Syrian Christian under Islamic rule:**
- Dhimmi status
- Churches maintained, +tax (jizya), +Cultural tech, +trade
- Specific protection-but-limitation regime

**Loyalty triggers:**
- Started moderate baseline (40–60)
- Increased: tolerance score, protection events, charter grants, prosperity, recognition (charter to elect own community leaders), prestige of state
- Decreased: persecution events, special targeting taxes, blood libel / religious accusations, neighboring expulsions raising fear, ruler Cruel/Zealous
- Below 25: emigration requests
- Below 10: mass exodus event, severe economic loss

**Expulsion mechanics (player decision):**
- Available decision: "Expel [Diaspora] Communities"
- Triggers when ruler Zealous + low tolerance + religious tension event
- Consequences:
  - **Economic crash** — Burgher influence drops, trade collapses, banking halved decades
  - **Cultural tech penalty** long-term
  - **Religious unity boost** short-term (the lever rulers actually used)
  - **Refugee event** — receiving nations one-time tech + trade bonus
  - **Foreign opinion** — depends on era/target faiths
  - **Reputation** — persistent Aggressive/Cruel modifier
  - **Long memory** — generations of dynasty + nation events reference

**Historical expulsions scripted:**
- English Edict 1290
- French Expulsions 1306, 1394
- Spanish Alhambra Decree 1492 (major scripted event chain end of Reconquista — Spain set in motion, Ottoman + Netherlands get refugee tech/trade boost)
- Various German expulsions 13th–15th centuries
- Various Eastern European pogroms 14th–17th centuries
- Russian expulsion waves later
- Mongol/Mughal generally tolerant — different model, communities thrive

**Refugee chains:**
- When expelled, refugees flee to nearby tolerant nations
- Receiving nation event: "Communities Arrive"
- Welcome: +tech, +trade, +Cultural Influence, +diplomatic prestige, tolerance rises
- Restricted Welcome: some bonuses
- Refuse: refugees pass through, neighbors may welcome
- **Historical:** Netherlands, Ottoman, Polish-Lithuanian Commonwealth massively benefited from Sephardic 1492, Huguenot 1685

**Mechanical truth modeled:**
- Tolerance economically valuable
- Persecution economically self-destructive
- Player can replay mistakes or learn from them
- The game shows what was lost — concrete, visible mechanical loss

**Specific event content commitments:**
- ~15 diaspora-specific events per major diaspora estate
- Careful, historically informed writing
- Persecution events unflinching about consequences
- Tolerance events celebrate contributions
- Convivencia-era Iberian content acknowledges peaceful coexistence as real historical period

### Pretender Wars — distinct mechanic

**Triggers:**
- Character with recognized claim challenges current ruler
- Backed by estate (Nobility most common, Clergy or Burghers possible)
- May be backed by foreign power (Sponsor Pretender intrigue)
- Often during weak rulers, regencies, controversial decisions

**Claim strength based on:**
- Blood proximity to throne
- Legitimacy (legitimate > legitimized bastard > unlegitimized > distant cousin)
- Backing estates' influence
- Foreign backers' commitment
- Current ruler vulnerabilities (Cynical/Cruel/Weak, recent failed war, low estate loyalty)

**Pretender War mechanics distinct from estate revolt:**
- Pretender is character on field — own stats/traits, can lead armies
- Provinces split between Loyalist and Pretender by local estate loyalty
- Foreign powers may join either side
- Pretender fighting to become legitimate ruler, not extract concessions
- Cannot peacefully negotiate — must be decisively won
- Pretender victory = throne change, dynasty change, possibly nation rebrand

**Outcomes:**

**Loyalist wins:**
- Pretender executed (Cruel ruler) or exiled (Just ruler)
- Backing estates lose major loyalty + influence
- Foreign backers diplomatic hit
- Some claims permanently extinguished, distant cousins may try later
- Ruler gains "Conqueror" or "Tyrant" depending on conduct

**Pretender wins:**
- Current ruler killed, captured, or exiled
- Pretender becomes new ruler
- Backing estates' privileges expanded
- Foreign backers gain new ally indebted
- Cadet branch transition possible — pretender may formally found new dynasty

**Stalemate:**
- Rare: split realm
- Civil war re-ignites later

**Historical analogues this enables:**
- Empress Matilda vs Stephen (just before game start, similar setups)
- Plantagenet vs Plantagenet (Wars of the Roses, late 1400s)
- Castilian succession crises
- Mughal succession wars (procedural, historically the rule)
- Mongol succession crises (post-Genghis fragmentation)
- Mamluk usurpations (constant historical pattern)
- Sons rebelling against fathers (Henry II vs sons, procedural)

**Player perspective:**
- As current ruler: defend against pretenders, manage estate loyalty
- Decide whether to legitimize cadet branches (loyalty bonus now, claim challenges later)
- "Play as pretender" branching: switch characters mid-game in succession crisis

### Estates-to-parties transition — dual-trigger

Both era threshold AND government reform required:
- Era: typically Early Modern → Industrial (~1700–1850)
- Reform: Constitutional Monarchy, Parliamentary Republic, or Revolutionary Republic
- Some nations transition earlier with specific reform combos; some never (conservative empire stays estate-based)

**Transition stages:**

**Stage 1: Faction Emergence (~1600s):**
- Estates spawn Factions within themselves (Liberal Nobility vs Conservative Nobility, Reform Clergy vs Traditional Clergy)
- Factions have miniature loyalty/influence per estate
- Player can side with factions

**Stage 2: Proto-Parties (~1700–1820):**
- After Constitutional reform unlocked, factions can formally organize across estates
- Whig faction crosses Burgher + Reform Nobility + Burgher-aligned Clergy
- Tory faction crosses Conservative Nobility + Traditional Clergy + Rural Peasants
- Limited elections of legislatures begin (constrained franchise)

**Stage 3: Full Party Politics (~1820+):**
- Estates remain as social classes but politics organized by parties
- Multi-party elections regular
- Franchise expands via reform (property qualifications → male suffrage → universal)
- Industrial Workers emerge as new political-economic class with Socialist/Labor alignment
- Press, public opinion, mass media as factors

**Nations that don't transition:**
- Theocracies refusing reform stay estate-based
- Some Asian states historically held to estate-class longer
- Steppe/tribal may transition differently (Russian-Soviet pattern proto-version, Ottoman pattern)
- Player can deliberately resist as "conservative empire" strategy with bonuses (high prestige, strong Nobility loyalty) but tech penalty and unrest from frustrated reform demands

**Transition events:**
- "Constitutional Crisis" — reform demanded but not granted
- "First Elections" — major event, sets up party system
- "Franchise Expansion" — decision to widen electorate
- "Party Coalition Government" — when no party wins majority
- "Revolutionary Moment" — if too long resisted

### Estate privileges — aging and evolving

**Privilege types:**

**Hereditary (permanent unless revoked):**
- Granted in perpetuity, transferable across rulers
- Revoking has severe consequences
- Most powerful but ossify the realm

**Charter (sunset-based, 25–50 years):**
- Must renew at expiration
- Estate may demand expansion at renewal
- City Charter, Burgher autonomy

**Era-Reformed (auto-evolve at era thresholds):**
- Some privileges automatically transform
- Medieval "Tax Exemption" → Early Modern "Reduced Tax" (less powerful, doesn't fully exempt) — modeling historical erosion
- Player can accept or actively reform during shift
- Some become obsolete and silently retire

**Reform-Triggered:**
- Government reform actions consolidate, rename, or replace privilege sets
- "Administrative Monarchy" reform consolidates 4 medieval Nobility privileges into 2 modernized
- "Absolute Monarchy" reform strips most lasting estate privileges, replacing with ceremonial honor-only forms

**Consolidation events:**
- "Codification of Law" — late medieval / early modern, consolidates customary into formal law
- "Estates General Convention" — estates renegotiate privileges with crown all at once
- "Royal Charter Reform" — crown unilaterally restructures (costs prestige + loyalty hits)

### Stability score (0–100)

```
Stability = 50 baseline
  + sum(estate_loyalties / 5)
  + (religious_unity - 50) / 4
  + cultural_unity_modifier
  + ruler_traits_modifier (Just +5, Cruel -5, Wise Ruler +3, etc.)
  + recent_events_modifier (decaying)
  + war_modifier (active -5, won +10, lost -15)
  + treasury_modifier (deficit -3, surplus 0)
  + heresy_present (-5 per active heresy)
  + diaspora_unhappiness (-3 per below 20 loyalty)
  + privilege_count_excess (-1 per privilege >6 granted, modeling ossification)
```

Capped 0–100.

**Bands:**
- 75+: Bonuses everywhere (+10% tax, +10% manpower, +5% tech, +10% building speed)
- 50–74: Normal
- 25–49: Minor penalties, some unrest events
- 0–24: Major penalties, revolt risk, foreign powers see weakness, possible nation collapse cascade

### AI estate management

**AI decision priority:**
1. Avoid catastrophic loyalty crashes
2. Maintain stability >40
3. Pursue ambitions (throttled by stability)
4. React to events per AI personality

**AI personalities affect:**
- Aggressive AI accepts more demands to keep estates happy for wars
- Reformer AI gradually centralizes by revoking (with costs)
- Traditionalist AI piles on Hereditary privileges
- Stagnant / Bad AI ignores demands → frequent revolts (some nations should be unstable)

**Performance:**
- Monthly tick (not daily)
- Simplified threshold checks
- Major events trigger immediate logic

### Estate management UI

**Primary Estates Screen:** single tap from main HUD. All active estates with loyalty bar, influence bar, land share %, active privileges count, pending demands, recent events, "Manage" button.

**Estate Detail Drawer:** privileges with descriptions and expiration, available grants, active events, key characters, provinces (mini-map).

**Stability Indicator:** always-visible top bar, color-coded, tap for breakdown.

**Faction/Party View (late game):** replaces Estate Detail when parties emerge. Platforms, current leader, member estates, polling/support, election timer, coalition possibilities.

### Content scope

- ~150 estate-specific events at v1.0 (~25 per active estate type)
- ~30 diaspora-specific events total
- ~20 cross-estate / political crisis events (Magna Carta-style constitutional moments)
- Tier 1 nations bespoke; Tier 2/3 universal pool
- Modular content authoring — add events without code changes

---

## 12. System 8 — Ideology & Nation Personality

### 7-axis ideology vector

Each nation has 7 independent axes, each -100 to +100:

1. **Militarist ↔ Pacifist** — war as policy tool
2. **Mercantile ↔ Agrarian** — trade vs land economy
3. **Theocratic ↔ Secular** — religion's role in governance
4. **Open ↔ Isolationist** — engagement with foreigners, refugees, ideas
5. **Aristocratic ↔ Populist** — power concentrated elites vs broader base
6. **Traditional ↔ Progressive** — established customs vs reform
7. **Centralist ↔ Federalist** — central authority vs regional autonomy

Most nations sit -40 to +40 with one or two outlier axes giving distinct character.

### Hand-authored 1200 starting vectors

All 80 nations get hand-authored vectors.

**Examples:**
- **France 1200**: Mil +25, Merc -10 (agrarian), Theo +30, Open +5, Aris +30, Trad +35, Cent +10
- **Venice**: Pac -20, Merc +75, Sec -20, Open +40, Aris +30 (patrician), Trad +10, Cent +20
- **Mongol clans (pre-unification)**: Mil +60, Agr -30 (pastoralist), Theo +5, Open +15, Aris +20 (tribal), Trad +30, Fed -40
- **Song China**: Pac -30, Merc +20, Sec -15, Iso -15, Aris -10 (meritocratic), Trad +30, Cent +60
- **Kingdom of Jerusalem**: Mil +50, Merc +30 (Italian merchants), Theo +60, Open +10, Aris +40, Trad +20, Cent -30
- **Ayyubid Sultanate**: Mil +30, Merc +20, Theo +40, Open +5, Aris +25, Trad +25, Cent +10
- **Papal States**: Pac -10, Agr -20, Theo +90, Open -10, Aris +40, Trad +50, Cent +30
- **Kievan Rus (Novgorod)**: Pac -10, Merc +50, Sec -15, Open +30, Pop -10 (Veche), Trad +20, Fed -30

### Archetype list (~30 archetypes)

**Universal medieval/early-period:**

1. **Feudal Kingdom** — Militarist mid, Agrarian, Theocratic mid, Aristocratic+, Traditional+, baseline 1200 default
2. **Crusader State** — Mil+, Theo++, Open mid, Aris+, Cent-
3. **Merchant Republic** — Merc++, Open+, Aris+ (patrician) or Pop+, Cent mid
4. **Trade League** — Merc++, Fed--, Open+
5. **Theocracy** — Theo+++, Aris+, Trad+, Cent+ (Papal States, Tibetan)
6. **Bureaucratic Empire** — Cent++, Aris-/0, Trad+, Merc mid (Song China, Goryeo)
7. **Warrior Aristocracy** — Mil+, Aris++, Trad+, Fed- (Kamakura, Norman)
8. **Steppe Horde** — Mil++, Fed---, Trad+, Open+ (Mongols pre-unification)
9. **Tribal Federation** — Fed---, Trad+, Pop+ (sub-Saharan confederations, pre-state Norse)
10. **Caliphate** — Theo+, Cent+, Aris+, Open mid (Abbasid, Umayyad)
11. **Sultanate** — Mil+, Theo+, Cent+, Aris+ (Ayyubid, Seljuk Rum, Mamluk)
12. **Khanate** — Cent+, Open+, Merc mid, Fed- (Yuan, Ilkhanate, Golden Horde when settled)

**Indian / South Asian:**

13. **Hindu Mahajanapada** — Aris+ (caste), Theo+, Trad++, Fed- (Chola, Pandya, Hoysala)
14. **Indian Sultanate** — Mil+, Theo+, Open mid, Cent+ (Delhi)
15. **Vijayanagara-type Empire** (Renaissance+ unlock) — Cent+, Mil+, Theo+ (Hindu), Aris+

**African:**

16. **Sahel Empire** — Merc+ (trans-Saharan), Theo+ (Islamic ruling), Fed- (tribal subjects), Open+ (Mali, Songhai, Kanem-Bornu)
17. **Christian Highland Kingdom** — Theo+, Trad++, Iso+, Aris+ (Ethiopia, historical Nubia)
18. **Coastal Trading State** — Merc++, Open+, Theo mid, Fed- (Swahili coast, later)

**East Asian / Southeast Asian:**

19. **Mandala Kingdom** — Theo+ (Buddhist or Hindu), Cent mid, Fed-, Aris+ (Khmer, Pagan, Sukhothai — devarāja sacred kingdoms with concentric vassal rings)
20. **Maritime Sultanate** (Renaissance+ unlock) — Merc++, Theo+, Open+, Fed- (Aceh, Malacca, Brunei, Sulu)
21. **Shogunate** — Mil+, Aris++, Cent+ (formal), Fed- (effective), Trad++ (Japanese; emerges from Warrior Aristocracy reform)

**Modern era (era-locked):**

22. **Enlightened Monarchy** (Renaissance+) — Cent+, Prog+, Aris mid, Open+
23. **Absolute Monarchy** (Early Modern+) — Cent++, Aris+, Trad+, Theo mid (Bourbon France, Habsburg Spain)
24. **Constitutional Monarchy** (late Early Modern+) — Cent mid, Prog+, Pop mid, Open+ (Britain 1688+)
25. **Reformed Republic** (early modern+) — Pop+, Merc+, Prog+, Open+ (Dutch Republic, early American)
26. **Revolutionary Republic** (Industrial) — Pop++, Prog++, Sec--, Cent+ (Revolutionary/Napoleonic France)
27. **Industrial Empire** (Industrial) — Merc+, Prog+, Cent+, Open+ (Victorian Britain, Wilhelmine Germany)
28. **Cosmopolitan Empire** — Open++, Fed-, Prog+ (Ottoman peak millet, Habsburg multinational, late Roman)
29. **Reactionary Empire** (Industrial) — Trad++, Aris++, Cent+ (post-1815 Habsburg/Russian)
30. **Hermit Kingdom** — Iso---, Trad++, Aris+ (Tokugawa Japan, Joseon Korea, Tibet later)

**Specialty:**

31. **Confederation** — Fed---, Open+, Pop mid (Swiss, early US, German federal)
32. **Pirate Republic / Buccaneer State** (rare, era-locked, mostly emergent) — Mil+, Merc+, Pop+, Fed--

Each archetype data-defined for easy addition. List grows over project lifecycle.

### Archetype transition pacing — fluid with era acceleration

Expected 3–5 transitions per nation across 700-year campaign.

**Base drift rate:** ~0.3 points per axis per month average (all sources combined). Over decade ~36 points on aligned axes. Over century ~360 points — full range achievable if conditions sustained.

**Era acceleration multipliers:**
- Medieval (1200–1450): 0.8× — slow change, stable feudal, ~250 years per transition typical
- Renaissance (1450–1600): 1.0× — reference
- Early Modern (1600–1800): 1.3× — reforms accelerate
- Industrial (1800+): 1.8× — rapid change, revolutionary moments

**Transition trigger:**
- Vector enters another archetype's signature zone
- Sustained 3+ years (prevents rapid flickering)
- Major archetype-shift event with player decision moments

**Archetype transition event:**
- Pause-and-acknowledge with narrative framing
- Choice: Accept (transition completes, bonuses) or Resist (delay with stability cost, may eventually fail and force)
- Old archetype-specific privileges/decisions phase out
- New options unlock
- Foreign nations reassess opinion
- Estates respond differentially

**Example arcs:**

**France 1200–1900:**
- 1200: Feudal Kingdom
- ~1450: Reformed Monarchy (after Hundred Years War)
- ~1600: Absolute Monarchy (Richelieu/Louis XIV)
- ~1790: Revolutionary Republic (massive forced shift)
- ~1810: Industrial Empire (Napoleonic centralization + early industrial)
- ~1870: Constitutional Republic (Third Republic)

**Venice 1200–1797:**
- 1200: Merchant Republic
- ~1450: Merchant Republic with Aristocratic creep (Council of Ten)
- ~1600: Stagnating Merchant Republic
- ~1800: nominally same archetype with Traditional drift toward stagnation

**Mongol Hordes 1200–1500:**
- 1200: Tribal Federation (clan stage)
- 1206: Steppe Horde (unified under Genghis)
- ~1240: Steppe Horde peak
- ~1350: Settled Khanate (Cosmopolitan Empire in some successor states, Reactionary in others)
- ~1500: Various reformed-or-stagnated paths per successor

### Ruler power over ideology — transformative

Peter the Great, Atatürk, Meiji-emperor arcs achievable for strong-trait player characters.

**Ruler influence formula:**
- Major trait ruler (Reformer, Conqueror, Zealous, Cynic, Saintly): 0.3–0.5 points per month on aligned axes
- High-stat ruler bonus: +0.1 to aligned shifts
- Triple-trait alignment (Reformer + Patient + Just): stacks to 1.0+ per month on relevant axes
- 30-year reign transformative ruler: 200+ points on prioritized axes — fundamentally transforms archetype

**Multiple alignment stacking:**
- Personal trait push
- Court Intellectuals push (Reformer-trait courtiers add ~0.1/month each)
- Active reform decisions (each: -10 to +20 immediate shift on aligned axes)
- Adopted institutions (each: +20-40 immediate shift on aligned axes)

**Peter the Great arc example:**
- Start Reactionary archetype (Russian historical setup)
- Ruler with Reformer + Patient + Wroth, high Stewardship
- 30-year reign: import foreign experts (refugee events), force noble Westernization (estate restructuring), adopt institutions aggressively, capital relocation
- End reign with Industrial Empire trajectory established
- Vector shifted 100+ points Progressive, Open, Centralist, Secular
- Estates radically restructured
- Multiple archetype transitions in single reign

**Bad rulers can transform negatively:** Cruel + Greedy + Wroth can crater a progressive nation into Reactionary. Why succession matters.

### Scripted ideology earthquakes — hybrid with emergent

Major historical ideology shifts have **scripted trigger windows** firing only if vector conditions align.

**Scripted earthquakes:**

- **Genghis Khan Unification (1206 window)** — Mongol clans + Temujin alive + military successes → Steppe Horde archetype emerges from Tribal Federation
- **Albigensian Crusade (1209 window)** — already active 1200 in southern France, scripted fires
- **Magna Carta (1215 window)** — England low noble loyalty + weak king → Constitutional precedent set, Aristocratic privilege expansion event chain
- **Children's Crusade (1212 window)** — literal historical event, religious-charged peasant mass movement
- **Mongol sack of Baghdad (1258 window)** — Caliphate destroyed, Caliphate Claim becomes contestable
- **Reconquista Completion (1492 window)** — Castile-Aragon united + Granada-equivalent weak → completed, Alhambra Decree decision, Spain emerges as major Catholic power
- **Fall of Constantinople (1453 window)** — Byzantine weak + Ottoman strong + siege capability → massive event, religious authority shift, Third Rome contest available
- **Reformation (1517 window)** — Printing Press + low Papal Authority + Reformer-trait HRE constituent + Indulgence chain → cascading
- **English Civil War (1642–1651 window)** — Absolute Monarchy or Centralizing + Parliament resistance + religious tensions → Constitutional Monarchy or restoration with constraints
- **Glorious Revolution (1688 window)** — religious dispute + foreign succession claim available + Parliament strong → transition from Absolute toward Constitutional
- **American Revolution / Colonial Independence (1776 window)** — distant colonies + sustained Federalist + Populist shift + tax dispute → new independent nation emerges (Confederation or Reformed Republic)
- **French Revolution (1789 window)** — France-equivalent + Absolute Monarchy archetype + Populist shift sustained 50+ years + financial crisis + low Peasant loyalty → massive scripted event chain. Resolutions: Royal capitulation (gradual reform), Royal resistance (Constitutional war), Revolutionary triumph (Revolutionary Republic emerges)
- **Italian Unification (1848–1871 window)** — multiple Italian states + nationalist event chain + reformist leadership → unified Italian nation forms
- **German Unification (1864–1871 window)** — Prussian-equivalent dominant + nationalist movement + war victories → unified German nation forms
- **Meiji Restoration (1868 window)** — Japan-equivalent Hermit Kingdom + Western contact event chain + reformer Daimyo faction strong → mass forced shift toward Industrial Empire, Samurai estate dissolution, massive Open + Progressive shift over decade
- **Russian Revolution-equivalent (1917 window)** — game ends 1900 standard but late events may foreshadow

**Plus ~10 more scripted earthquake windows** for major historical inflection points.

**Plus the Black Death (1346–1353)** — fires regardless of player action, scripted historical pandemic. Plus Peasant labor-leverage Demands for Land/Wages event chain.

**Hybrid approach:**
- Events fire on historical schedule if conditions align
- Conditions vector-state-based — alternate histories possible
- If France went Republic in 1500 due to early ideology shifts, 1789 Revolution doesn't fire (already Revolutionary)
- Conditions never align → event window expires silently
- Player divergence from history rewarded with unique histories, not penalized

### Differentiated victory paths by archetype

Score categories: Territory, Economy, Prestige, Dynasty, Technology, Cultural Influence, Religious Influence.

**Archetype-specific weights:**

**Conquest archetypes (Steppe Horde, Sultanate, Warrior Aristocracy, Crusader State):**
- Territory 1.5×, Economy 1.0×, Prestige 1.3×, Dynasty 1.0×, Tech 0.8×, Cultural 0.7×, Religious 1.0×

**Trade archetypes (Merchant Republic, Trade League, Coastal Trading State, Maritime Sultanate):**
- Territory 0.7×, Economy 1.5×, Prestige 1.0×, Dynasty 1.0×, Tech 1.2×, Cultural 1.3×, Religious 0.7×

**Cultural archetypes (Bureaucratic Empire, Enlightened Monarchy, Cosmopolitan Empire, Mandala Kingdom):**
- Territory 0.8×, Economy 1.0×, Prestige 1.2×, Dynasty 1.0×, Tech 1.5×, Cultural 1.5×, Religious 1.0×

**Religious archetypes (Theocracy, Caliphate, Christian Highland Kingdom):**
- Territory 0.8×, Economy 0.8×, Prestige 1.3×, Dynasty 1.0×, Tech 0.8×, Cultural 1.0×, Religious 2.0×

**Industrial/Modern archetypes (Industrial Empire, Constitutional Monarchy, Reformed Republic):**
- Territory 1.0×, Economy 1.5×, Prestige 1.2×, Dynasty 0.8×, Tech 1.5×, Cultural 1.3×, Religious 0.7×

**Reactionary/Traditional archetypes (Reactionary Empire, Hermit Kingdom, Absolute Monarchy):**
- Territory 1.2×, Economy 1.0×, Prestige 1.3×, Dynasty 1.3×, Tech 0.8×, Cultural 0.9×, Religious 1.1×

**Result:** A Steppe Horde maxing Territory + Prestige scores high — natural path. A Merchant Republic maxing Economy + Cultural scores high. Cross-path strategies possible but hard (Steppe → Cultural requires sedentarizing, which changes archetype).

**Distinct victory feel:**
- Steppe Horde 1900 9,000 from conquest and tribute — Conquering legacy ending
- Merchant Republic 1900 9,000 from trade and culture — Trading legacy ending
- Theocracy 1900 9,000 from religious unity and missions — Sacred legacy ending
- Each gets distinct ending screen, archetype-specific historical "what your nation became" narrative

### AI personality engine — unified

Each AI nation runs unified Personality Profile (computed monthly, cached):

```
Personality {
  archetype, vector,
  ruler (current with traits),
  ambitions (1-3 active),
  rivals (0-3 active),
  interests (regional list),
  threat_perception,
  reform_appetite (derived),
  aggression_score (derived),
  trustworthiness_score (derived),
  diplomatic_style (derived),
  religious_zeal (derived),
  expansionism_target (derived priority list),
  AI_difficulty_modifier
}
```

Read by: war declaration AI, alliance offering, reform decisions, estate management, diplomatic response, tech adoption.

**Example Tier 1 nation profiles at 1200:**

**France:** Archetype Feudal Kingdom, vector (Mil+25, Agr-10, Theo+30, Open+5, Aris+30, Trad+35, Cent+10), Philip II Augustus, ambitions [Reclaim Aquitaine, Strengthen royal authority], rivals [England], interests [Northwest Europe, Crusades], aggression 65, trust 70, diplomatic style Marriage-Heavy, religious zeal Medium, expansionism Aquitaine + Normandy + Flanders.

**Venice:** Archetype Merchant Republic, vector (Pac-20, Merc+75, Sec-20, Open+40, Aris+30, Trad+10, Cent+20), Doge, ambitions [Control Eastern Mediterranean trade, Suppress Genoa, Maintain access to Crusader ports], rivals [Genoa, Byzantium uneasy], interests [Mediterranean, Adriatic], aggression 30, trust 50, diplomatic style Trade-Focused, religious zeal Low, expansionism Trade Node Control.

**Mongol Clans:** Archetype Tribal Federation, vector (Mil+60, Agr-30, Theo+5, Open+15, Aris+20, Trad+30, Fed-40), Temujin, ambitions [Unify the steppe, Avenge father's death, Establish horde supremacy], rivals [Tatars, Naimans, Keraits, Jin Dynasty], aggression 90, trust 40, expansionism Steppe + Northern China + Khwarazm.

**The AI plays its character, not a generic strategy.**

### Player ideology levers — emergent with deliberate inputs

**Direct deliberate inputs:**
- Reform decisions (each: discrete vector shift, +10 to +30 aligned axes)
- Government reforms (large shifts + archetype gating)
- Institution embracement (major shifts on aligned axes)
- Ruler trait alignment (choose education focus, marry for trait inheritance, raise heirs deliberately)
- Court composition (appoint Reformer-trait courtiers to amplify shifts)
- Estate management (empower estate aligned with desired direction)
- Cultural patronage (sponsor movements)
- Diplomatic alignment (long alliance with target-archetype nation drifts you)
- Refugee absorption (welcoming refugees from Progressive nation drifts Progressive)

**Indirect/emergent:**
- Events resolved push vector
- Estate composition shifts
- Ruler succession new traits
- Cultural Influence pressure from foreign neighbors
- Era progression baseline shifts

**Net result:** Player can plan arcs ("take France from Feudal Kingdom to Enlightened Monarchy by 1700"). Realistic across 5–7 rulers with sustained good decisions. Or passively accept emergence — game still works.

### Visualization

**Ideology Radar Chart (primary):** central feature of nation panel. Seven-pointed radar. Filled color shape representing vector. Animated transitions on shift. Tap axis for explanation.

**Archetype Banner (top of nation panel):** current archetype name + flavor icon. Hint of next likely archetype if trending. Era badge.

**Ideology Drift Timeline (bottom of nation panel):** horizontal timeline campaign history. Major events marked. Archetype transition points highlighted. "Story of your nation."

**Foreign Ideology Comparison (in diplomacy):** side-by-side radar with target nation. Highlights ideology distance. Shows derived opinion modifiers. "How alien is this nation to us?"

**Archetype Decision Tree (forward-looking, optional):** show currently reachable archetypes. Each: required vector shift, suggested reforms, time estimate. Player can target an archetype goal and game tracks progress.

### Content scope

- ~30 archetypes with full data definitions
- ~25 scripted ideology earthquake events with trigger windows
- ~100 ideology-flavored events (smaller, contextual, fire based on vector state)
- Archetype-specific decisions (3–5 per archetype)
- Archetype-specific bonuses/penalties
- Archetype-specific endings/scoring narratives
- Era progression adds archetypes (medieval start ~12–15 available; industrial unlocks modern set)

---

## 13. Victory & Scoring

**No single win condition.** Score categories evaluated continuously, totaled at 1900:

- **Territory** — provinces × development
- **Economy** — peak income, trade node control
- **Prestige** — won wars, accomplishments
- **Dynasty** — cadet branches on foreign thrones, generations survived
- **Technology** — tech level vs era target
- **Cultural Influence** — provinces sharing your culture, Renowned Works, world buildings
- **Religious Influence** — provinces of your faith, missionary success

**Archetype-specific scoring weights** apply (see Ideology section). A 12-province trade republic with cadet branches on six thrones can absolutely beat a continental empire on points. **The deep-or-wide promise lives here.**

**Endgame screen** shows narrative of "what your nation became" by archetype path.

---

## 14. UI / iPad Considerations

**Primary screen:** SVG world map, panable/pinch-zoomable. Bottom dock has map mode toggles. Top bar shows date, speed controls, treasury, manpower, prestige, current ruler portrait.

**Drawers** (slide up from bottom or in from right) for:
- Province details
- Nation panel
- Dynasty view
- Diplomacy
- Military
- Technology (5 tree strips horizontal scroll)
- Ledger
- Estates
- Religion

**iPad-first principles:**
- Tap targets minimum 44pt (Apple HIG)
- No hover states anywhere
- Long-press for context menus
- Gestures: pinch zoom, two-finger pan, swipe up for nation panel
- Portrait + landscape both supported (landscape primary)

**Notifications** queue in top-right as tappable badges. Critical ones force a pause.

**Stability indicator** persistent in top bar with color coding.

---

## 15. Tech Stack

- **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Zustand**
- **SVG map** with React, memoized provinces, simplified geometry (~400 polygons comfortable)
- **Seeded RNG** (West Francia approach) — reproducible campaigns, shareable via seed
- **Save/load:** localStorage v1 with versioned schema; IndexedDB for full saves later
- **PWA manifest** for iPad install (full-screen, no browser chrome, app icon)
- **Repo:** GitHub `michaelmuirhead/KingdomCome`
- **Deploy:** Vercel auto-deploy on push to main, preview deploys on branches for iPad testing

---

## 16. Data Architecture

```
/data
  /provinces          ~400 province definitions (JSON)
  /nations            ~80 nation definitions with starting state
  /rulers             Hand-authored 1200 historical characters (~500)
  /cultures           Culture groups, naming pools, government bonuses
  /religions          Faith definitions, doctrines, conversion rules
  /traits             Character trait pool (~120)
  /buildings          Building definitions by era
  /units              Unit definitions by era
  /tech               Five tech trees with all nodes
  /institutions       Institution definitions and spawn conditions
  /events             Event script files (~200 for v1)
  /archetypes         ~30 ideology archetype definitions
  /estates            Estate template definitions per nation type
  /diaspora           Diaspora estate definitions + event content
  /privileges         Estate privilege definitions by era
  /trade_nodes        ~30 trade node definitions
  /trade_goods        ~50 trade good definitions
  /pilgrimage_sites   Pilgrimage city definitions by faith
```

**State management** via Zustand stores split by concern:
- `worldStore` — map, time, global state
- `nationStore` — all nation states
- `dynastyStore` — characters, families, court roles
- `economyStore` — treasuries, trade nodes, prices, buildings
- `militaryStore` — armies, navies, wars, sieges
- `diplomacyStore` — opinions, treaties, alliances, ambitions, rivals
- `religionStore` — faiths, religious heads, doctrines, papal favor, tolerance
- `politicsStore` — estates, loyalty, influence, privileges, parties (late game)
- `techStore` — tech trees, institutions, era progression
- `ideologyStore` — vectors, archetypes, transitions
- `eventQueueStore` — pending events
- `uiStore` — current view, drawers open, selected entities

---

## 17. Build Roadmap

**v0.1 — Skeleton (riskiest stuff first)**
Render ~50 Western European provinces on iPad. Pan/zoom works. Tap-to-select. Player picks France or England. Monthly tick fires, treasury and manpower update. One AI neighbor declares basic war. Ruler has stats, dies, heir takes over. **Goal: prove the loop runs on iPad.**

**v0.2 — Width**
Expand to ~150 provinces (Europe + North Africa). 30 nations active with basic AI. Trade nodes working. Ideology vector tracked and displayed. Basic diplomacy actions.

**v0.3 — Depth**
Estates with full mechanics (loyalty, influence, privileges, demands, revolts). Religion full system (Papal Authority, religious heads as characters, tolerance scale, leadership claims). Full succession laws + Pretender Wars. Claims, CBs, war goals. Event system with ~50 events.

**v0.4 — Era progression**
Institutions spawn and spread. Era thresholds trigger. Full five-tree tech. Government reform tree. Reformation event chain. Cultural Influence patronage layer. Cultural conversion of provinces. Forced divergence + catch-up paths. Steppe absorption.

**v1.0 — Full world**
Expand to 400 provinces, all 80 nations, full hand-authored 1200 character database (~500 characters), scoring with archetype-weighted categories, victory screen at 1900. Polish pass on iPad UX. Save/load stable. All scripted ideology earthquakes wired. ~200 events total. Diaspora estate full mechanics + expulsion/refugee chains.

**v1.x — Polish & depth**
Combat depth (battle phases), music, full dynasty tree visualization, AI personality differentiation polish, balance, more events (~300+ total), achievements, portrait art (placeholders → AI-generated). Regional pricing tiers as enhancement.

---

## 18. Content Scope Summary

### Hand-authored content totals at v1.0

- **~400 provinces** with full data
- **~80 nations** with starting states
- **~500 characters** in 1200 hand-authored database (tiered by nation importance)
- **~30 trade nodes**
- **~50 trade goods**
- **~30 buildings**
- **~30 unit types** across all eras
- **~20 faiths** + ~40 doctrinal variants
- **~30 archetypes**
- **~120 traits**
- **~200 events** at v1.0 (target 300+ post-launch)
- **~150 estate-specific events** (~25 per active estate type)
- **~30 diaspora-specific events**
- **~25 scripted ideology earthquake events**
- **~100 ideology-flavored events**
- **Tech: 5 trees × ~15 nodes each = ~75 tech nodes**
- **Institutions: 7 major institutions** + spawn conditions
- **Pilgrimage sites: ~25** across all faiths
- **Government reform tree** + side branches
- **Cultural promotion + tolerance reform paths**

### Implementation order priority

1. Map + tick loop (v0.1)
2. Economy basics + ideology vector (v0.2)
3. Dynasty + Estates + Religion (v0.3)
4. Tech/Culture + Era progression (v0.4)
5. Full world + scoring + scripted earthquakes (v1.0)
6. Polish (v1.x)

---

*End of design document. This document represents the locked v1 design for Kingdom Come.*
