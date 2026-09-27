# The Dossier of K. — Design

A browser game narrated by Franz Kafka himself. He walks through his own fiction and the fiction of the writers he stands between, Dostoevsky before him and Orwell after him. The world closes in. A small light stays on.

## Pillars

| Requirement | How the game answers it |
|---|---|
| Kafkaesque dread | The frame itself closes. Cinemascope bars and side walls converge as **dread** rises, and the score tightens with them. |
| Kafka's point of view | Everything is first-person narration: Kafka (K.) living through his characters. Biography leaks in, such as the insurance office, the unsent *Letter to His Father*, and Spindlermühle 1922. |
| Dostoevskian journey | Every file ends in a moral choice between **obey**, **defy** (Raskolnikov's "extraordinary man", the Underground Man's spite, the Übermensch) and **love** (Sonya, Grete, Frieda, Liza). The pattern of choices decides the ending. |
| Nihilism, Übermensch | *God is dead, and someone must be allowed everything* is whispered by the Theory in *The Axe*. In *The Cellar*, 2 × 2 = 5 is offered as freedom, and in *The Correction* the same answer is demanded as obedience. |
| Orwell | *The Correction* (1984): a sweeping telescreen eye, a memory slot, and the question 2 + 2 = ? |
| Non-linear, Nolan-like | The archive hands out files **scrambled**. Black-and-white **interrogations** always run **forward** between them, so two timelines run in opposite directions, as in *Memento*. At the end the files **reassemble** in true order. |
| Villeneuve visuals | Long lenses and huge scale: a tiny silhouette against monoliths, fog and one dominant colour per place (snow white, sodium amber, sick ochre, telescreen red). Hard light shafts and film grain. |
| Soundtrack | A generative drone that opens as dread rises, an endless Shepard tone, a sub-bass heartbeat, and brass "braams" on choices. The only consonant chord in the score is the hope chime. |
| A small message of hope | One **ember** is hidden in each file. Each carries one word of: *Something in you cannot be destroyed* (after Kafka's Zürau aphorisms). |

## Recommended mechanic: exploration in a closing frame

Four forms were considered:

- **Visual novel:** strong for narration, but the player never *feels* the walls.
- **Point-and-click:** puzzle logic fights the dream logic. Kafka's world has no solutions.
- **Survival or stealth game:** too much agency, and it turns dread into a fail state.
- **Side-scrolling exploration where the frame itself is the antagonist (chosen).** You walk. The world does not attack you; it simply closes, like a process. You can always keep going, and you can never quite win.

The core loop, repeated in every file:

1. **Walk** a single long shot, left or right, as a tiny figure.
2. **Dread** rises with time and with the file's own pressure. The letterbox and side walls close, the drone brightens and the heart speeds up.
3. **Examine** things (E / Space). Each gives one line of self-narration.
4. **Find the ember** (optional). It pushes the walls back and saves one word of hope.
5. **Reach the goal** and make a **choice**. If dread reaches 1 first, the walls meet: the file is marked *EINGESTELLT* (proceedings suspended), the ember is lost, and **the verdict comes anyway**. You still choose. The process never lets you out early.

A file, once opened, cannot be reopened. Files are not failed or won. They are filed.

## The six files

Shown in the archive in this order: 1984, 1912, 1864, 1922, 1866, 1914. True order: 1864 → 1984.

| File | Source | The world closes by… | The ember |
|---|---|---|---|
| **The Cellar** (1864) | *Notes from Underground* | Both walls physically converge. One of them is carved *2 × 2 = 4*. | Behind the stove, on the far side from the goal. You must go against the clock to get it. |
| **The Theory** (1866) | *Crime and Punishment* | Each of the 730 counted steps raises the dread floor, and the Theory whispers. | Sonya's cypress cross on a stranger's step. |
| **The Morning** (1912) | *The Metamorphosis* | The family knocks. Movement is by **tapping** only: an insect body with no rhythm. Turning the key takes a held action while dread climbs. | Behind the glass of the picture of the lady in furs. |
| **The Arrest** (1914) | *The Trial* | The Magistrate's door **loops** the corridor, and each loop lowers the ceiling. | After the first loop, behind the start. The way out was never in front of you. |
| **The Summons** (1922) | *The Castle* | The Castle **recedes** as you approach, and **standing still** lets the snow bury you. | Listening at the telephone: the humming of childlike voices. |
| **The Correction** (1984) | *after Nineteen Eighty-Four* | A sweeping **eye**. Moving in its red light floods dread; the pillars hide you. | In the alcove the screens cannot see. |

## Endings

The most-chosen stance decides the ending. Ties go to love, then defy.

- **The Clerk** (obey): the gatekeeper's line. The door was meant only for you, and now he shuts it. A radiance still streams from its outline.
- **The Underground** (defy): you push through, and there is another door and a larger gatekeeper. You made your own law, but a small light remains that you did not make.
- **The Crossing** (love): you stop facing the door and turn around. Someone has been waiting behind you all along.

Every ending then assembles the hope message. Words you missed appear faintly, then fill in: *it was never yours to lose.* The last card is the true story of Max Brod refusing to burn the manuscripts.

## Structure

```
Title → Prologue (Before the Law) → Archive ──┐
            ┌─────────────────────────────────┘
            ▼
   Interrogation n (B&W, forward)  →  File (colour, any order)  →  Choice  →  Archive
            … ×6 …
Archive → "Put the files in order" (reassembly) → Epilogue (the Door) → Ending → Hope
```

## Tech

- Plain HTML, CSS and JS with no build step, all in `public/`. Open `public/index.html` directly or serve the folder.
- `js/audio.js`: the Web Audio score, fully synthesised with no audio files.
- `js/render.js`: the Canvas 2D toolkit (virtual space 1000 units tall, parallax, fog, light shafts, figures, particles, grain, and the closing frame).
- `js/story.js`: all text. `js/scenes.js`: the seven places. `js/game.js`: the state machine, input, narration, archive and ending.
- Progress is saved in `localStorage`.

## Where to take it next

- Voice: record a narrator (Czech-German accent, close-mic, dry) to replace the typewriter-only narration.
- More files: *The Burrow* (sound-only; the noise that never stops), *In the Penal Colony*, *A Hunger Artist*, and *Letter to His Father* as an interrogation-only chapter.
- A second pass through the archive in true order, a "director's cut" like *Memento*'s chronological edition, with narration that changes because you now know the ending.
- Hand-painted matte layers and real sound design (field recordings of Prague trams and attic wood) layered over the generative score.
