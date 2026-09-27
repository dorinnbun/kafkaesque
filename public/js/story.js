/* Every word K. says. The narration is original, written in the spirit of
   Kafka, Dostoevsky and Orwell. Lines wrapped in “ ” are speech (other
   voices); lines with kind:'whisper' are the voice of the Theory. */
(function () {
  const S = (window.KStory = {});

  // Chronological order of the fragments (by the year of the source).
  // The archive shows them scrambled; the ending sorts them back.
  S.chrono = ['underground', 'axe', 'insect', 'trial', 'castle', 'ministry'];
  S.shown = ['ministry', 'insect', 'underground', 'castle', 'axe', 'trial'];

  // The message of hope, one word per fragment, in chronological order.
  // After Kafka's Zürau aphorisms (1917–18): a person cannot live without a
  // lasting trust in something indestructible in themselves.
  S.hope = ['Something', 'in', 'you', 'cannot', 'be', 'destroyed'];

  S.prologue = {
    intro: [
      'Prague. By day I am a clerk. At night I write, and the writing goes where I cannot follow.',
      'In front of me there is a door. There has always been a door.'
    ],
    hint: '← → or A D to walk. E or Space to act.',
    gate: [
      { t: '“Not now,” says the gatekeeper. “It is possible. But not now.”', kind: 'speech' },
      'He gives me a stool. I sit down beside the door.',
      'Somewhere, a clerk opens a file with my initial on it.'
    ]
  };

  S.epilogue = {
    intro: [
      'I have sat on this stool for years. I gave the gatekeeper everything I owned.',
      'He took it all, so that I would not think I had left anything untried.',
      'My eyes are failing. I cannot tell whether the world is growing darker or only my eyes.'
    ],
    ask: [
      { t: '“Everyone strives to reach the Law,” I say. “How is it that in all these years no one but me has asked to come in?”', kind: 'speech' }
    ],
    endings: {
      obey: {
        name: 'Ending · The Clerk',
        lines: [
          'The gatekeeper bends down, because I have grown so small.',
          { t: '“No one else could ever be let in here. This door was made only for you. I am going to shut it now.”', kind: 'speech' },
          'The door closes. And yet, from its outline in the dark, a light streams out that does not go out.'
        ]
      },
      defy: {
        name: 'Ending · The Underground',
        lines: [
          'I stand. I push past him. He lets me. That is the worst part.',
          'Behind the door is another hall, another door, another gatekeeper, larger than the first.',
          'I made my own law. It had no door at all. Still, at the edge of the dark, there is one small light I did not make.'
        ]
      },
      love: {
        name: 'Ending · The Crossing',
        lines: [
          'I stop asking the door. For the first time, I turn around.',
          'Someone has been sitting behind me all these years, on a stool of their own, waiting for me to look.',
          'The door stays shut. It does not matter. The light was never in the door.'
        ]
      }
    },
    coda: 'It was never yours to lose.',
    codaPartial: 'The words you missed were there all along. It was never yours to lose.'
  };

  S.reassembly = 'Put in order, the case opens nineteen years before K. was born and closes sixty years after he died. The process was never about him. He was only passing through it.';

  // Black-and-white interrogations. Always shown in forward order,
  // whatever file you open: two timelines, one running each way.
  S.interrogations = [
    [['q', 'State your name.'], ['a', 'K.'], ['q', 'Only the one letter?'], ['a', 'The rest was taken as evidence.']],
    [['q', 'Occupation.'], ['a', 'Clerk. Workers’ Accident Insurance Institute, Prague. I calculate how many fingers the wood-planing machines take in a year.'], ['q', 'And at night?'], ['a', 'At night the machines calculate me.']],
    [['q', 'Do you know why you are here?'], ['a', 'No.'], ['q', 'Good. That is where it begins.']],
    [['q', 'Your father has submitted a letter.'], ['a', 'I wrote that letter to him. A hundred pages. I never sent it.'], ['q', 'It arrived regardless.']],
    [['q', 'Have you been sleeping?'], ['a', 'I write at night. The writing sleeps for me.'], ['q', 'The court has read what you wrote.'], ['a', 'Then the court knows more than I do.']],
    [['q', 'Final question.'], ['q', 'Why did you never go in?'], ['a', 'I was waiting for permission.'], ['q', '…']]
  ];

  S.fragments = {
    insect: {
      title: 'The Morning',
      work: 'after The Metamorphosis',
      year: 1912,
      when: 'Prague · 17 Nov 1912',
      az: 'Az. 1912/XI-17',
      intro: [
        'I woke from troubled dreams and the ceiling was very far away.',
        'I have too many legs now. None of them will take orders from me.',
        { t: '“It’s a quarter to seven. Don’t you have a train to catch?”', kind: 'speech' }
      ],
      hint: 'Tap ← → to crawl. Holding does nothing. This body does not keep a rhythm.',
      knocks: [
        { t: '“Gregor? It’s a quarter to seven.”', kind: 'speech' },
        { t: '“The chief clerk has come himself. Open the door.”', kind: 'speech' },
        { t: '“He’s ill. Can’t you hear he’s ill?”', kind: 'speech' },
        { t: '“Open up. We’re worried. Please.”', kind: 'speech' }
      ],
      window: 'Rain on the tin sill. The sky is the colour of a document waiting to be signed.',
      picture: 'A picture I cut from a magazine: a lady in furs. Behind the glass, something warm has stayed warm.',
      bowl: 'Milk with white bread soaked in it. It used to be my favourite. Now I cannot bear it.',
      doorLabel: 'Turn the key with your jaws',
      choicePrompt: 'The key turns. On the other side: my family, the chief clerk, the whole grey morning.',
      options: [
        { k: 'obey', t: 'Stand up as best you can. Apologise. Promise to catch the eight o’clock train.',
          out: ['I apologise in a voice no one can understand.', 'The chief clerk backs down the stairs as if I were on fire.', 'Father drives me back into my room with a walking stick and a rolled-up newspaper. I go. I obey. I was always going to obey.'] },
        { k: 'defy', t: 'Stay under the couch. Let them knock until they understand.',
          out: ['I do not come out. For days. For weeks.', 'Someone slides food under the door and stops asking what I want.', 'My refusal is the only thing in this flat that belongs entirely to me.'] },
        { k: 'love', t: 'Open the door wide. Let your sister see what you are.',
          out: ['Grete does not scream. She looks at me for a long time.', 'The next morning there is a bowl of old vegetables, the cheese I once refused, and a little water.', 'She guessed. No one else ever guessed anything about me.'] }
      ],
      collapse: 'They opened the door from the other side. I did not get to choose how I was seen.'
    },

    trial: {
      title: 'The Arrest',
      work: 'after The Trial',
      year: 1914,
      when: 'Prague · August 1914',
      az: 'Az. 1914/VIII-11',
      intro: [
        'Someone must have been telling lies about me. Nothing else explains the two men at breakfast.',
        'I am under arrest, they said. I may still go to work. I may go anywhere. That is the arrest.',
        'The court sits in the attics of the tenements. The court sits in every attic.'
      ],
      hint: 'Find the Examining Magistrate. The corridor may not agree.',
      bench1: 'A man on the bench stands up as I pass, as if I might be a judge. Then he sits down, ashamed of having hoped.',
      bench2: [{ t: '“How long have you been waiting?”', kind: 'speech' }, { t: '“Since before I was accused.”', kind: 'speech' }],
      painter: [{ t: 'Titorelli, the court painter: “A definite acquittal? I’ve never seen one. There are legends.”', kind: 'speech' }],
      doorLabel: 'Knock on the Magistrate’s door',
      loops: [
        [{ t: '“Your case is being processed. Please wait in the corridor.”', kind: 'speech' }, 'The corridor again. The ceiling is lower now. I am sure of it.'],
        [{ t: '“Your case is being processed.”', kind: 'speech' }, 'I have started to recognise the dust. What if the way out was never in front of me?']
      ],
      behind: 'Behind me, where I started, there is a slit of light under a door nobody uses. It says nothing. It is only light.',
      choicePrompt: 'The Examining Magistrate opens a small book. He looks up and asks whether I am a house painter.',
      options: [
        { k: 'obey', t: 'Accept the charge they have not told you.',
          out: ['I say: I am guilty. The Magistrate nods, relieved. It was a formality. So is everything.', 'The attic air is thin. It is easier to breathe once you stop asking why.'] },
        { k: 'defy', t: 'Make a speech. Denounce the whole court as a farce.',
          out: ['I speak magnificently. Half the room applauds. The other half is the same half.', 'Every man in the gallery wears the same badge under his beard. My speech has been entered into the record as evidence.'] },
        { k: 'love', t: 'Say it plainly: I don’t know what I did. But I am not innocent of everything.',
          out: ['The room goes quiet. For once, no one writes anything down.', 'Guilt admitted without a charge does not belong to the court. It is mine. I can carry it.'] }
      ],
      collapse: 'The ceiling reached my hat. The verdict was delivered to the floor.'
    },

    castle: {
      title: 'The Summons',
      work: 'after The Castle',
      year: 1922,
      when: 'Spindlermühle · January 1922',
      az: 'Az. 1922/I-27',
      intro: [
        'I was sent for. I am a land surveyor. No one here remembers sending for a land surveyor.',
        'The Castle is up there. Every step I take toward it, it takes one step back.',
        'Keep moving. Snow is patient. It buries anything that waits.'
      ],
      hint: 'Standing still lets the snow close in.',
      villager1: [{ t: '“The Castle? You can’t go there. No one goes there. Well, some do. Not you.”', kind: 'speech' }],
      phoneLabel: 'Listen at the telephone',
      phone: 'The line hums with a thousand distant voices, like children singing a long way off. Beneath them, one voice says my name as if it were kind.',
      villager2: [{ t: '“Klamm? You won’t see Klamm. I saw him once. It didn’t look like him.”', kind: 'speech' }],
      inn: 'The Bridge Inn. Frieda is behind the bar, drying a glass that is already dry. She looks at me the way no official ever has.',
      roadLabel: 'Keep going up the road',
      choicePrompt: 'The road does not lead to the Castle. It only bends toward it, and then, as if on purpose, turns away.',
      options: [
        { k: 'obey', t: 'Accept the post of school caretaker. Wait for the summons.',
          out: ['I sweep the schoolroom. I sleep on the gym mats. The summons will come.', 'Letters arrive, signed by officials I never meet. They praise work I have not done.'] },
        { k: 'defy', t: 'Leave the road. Climb through the snow toward the Castle without permission.',
          out: ['The snow comes up to my chest. The lights of the Castle stay exactly as far away as they were.', 'I climb anyway. A man who climbs toward nothing is still climbing.'] },
        { k: 'love', t: 'Turn back to the inn. Frieda is waiting.',
          out: ['I turn my back on the Castle. It makes no difference to the Castle.', 'It makes a difference to Frieda. Her hands are warm. For one evening I am a man who has arrived somewhere.'] }
      ],
      collapse: 'The snow finished what the officials started. They found my papers in order.'
    },

    ministry: {
      title: 'The Correction',
      work: 'after Nineteen Eighty-Four',
      year: 1984,
      when: 'London · 4 April 1984',
      az: 'Az. 1984/IV-04',
      intro: [
        'I died in 1924. The office did not notice. It kept me on the books and moved me to a larger building.',
        'The eye on the screens sees everything, except what stands still in the shadows.',
        'When the red light finds you, do not move.'
      ],
      hint: 'Moving inside the red light brings the walls in fast. The pillars hide you.',
      poster: 'WHOEVER KEEPS THE FILES KEEPS THE PAST. The poster has been corrected so often that the paper has gone soft.',
      slot: 'A slot in the wall, warm with the draught from the furnaces below. Yesterday goes in. It is always yesterday.',
      alcoveLabel: 'Look in the alcove',
      alcove: 'An alcove the screens cannot see. Someone left a notebook here. One page. One word, written very small.',
      canteen: 'Everyone eats quietly. Everyone is thinking the same small thought: do not think.',
      deskLabel: 'Sit at the correction desk',
      choicePrompt: 'The screen asks one question and will accept one answer. It reads: 2 + 2 =',
      options: [
        { k: 'obey', t: '5',
          out: ['I type 5. The screen thanks me by name. It uses a name I did not know I had.', 'The terrible thing is not that I lied. The terrible thing is how quiet it is afterwards.'] },
        { k: 'defy', t: '4',
          out: ['I type 4. The room does not change. Nothing happens for a very long time.', 'Then the lights in my corridor go out, one by one, very politely.'] },
        { k: 'love', t: 'Leave the answer blank. Beneath it, write the name of someone you love.',
          out: ['I write a name. The screen cannot parse it. It files it under ERRORS.', 'Somewhere in the building an error is being kept safe. It is the only thing in here that belongs to anyone.'] }
      ],
      collapse: 'The eye did not need me to answer. It had already answered for me.'
    },

    axe: {
      title: 'The Theory',
      work: 'after Crime and Punishment',
      year: 1866,
      when: 'St Petersburg · July, a heatwave',
      az: 'Az. 1866/VII-09',
      intro: [
        'Not my city. Not my century. The heat is the same.',
        'From my garret to her door is exactly seven hundred and thirty steps. I have counted them.',
        'There is a theory. Extraordinary men have the right to step over. The theory walks beside me, whispering.'
      ],
      hint: 'Every step is counted.',
      whispers: [
        { t: 'Napoleon would not have trembled.', kind: 'whisper' },
        { t: 'An old pawnbroker. A louse. Who would miss her?', kind: 'whisper' },
        { t: 'One death and a hundred lives. Simple arithmetic.', kind: 'whisper' },
        { t: 'Am I a trembling creature, or do I have the right?', kind: 'whisper' },
        { t: 'God is dead, and someone must be allowed everything.', kind: 'whisper' }
      ],
      tavern: [{ t: 'A drunk civil servant grips my sleeve: “Do you understand, sir, what it means to have nowhere left to go?”', kind: 'speech' }, 'I understand it too well.'],
      haymarket: 'The Haymarket. Someone says her sister will be out tomorrow at seven. The old woman will be alone. The universe arranges itself like a file.',
      crossLabel: 'Pick up what lies on the step',
      cross: 'On the step outside a stranger’s door, a small cypress-wood cross. Someone who has nothing gave away the one thing she had.',
      lodge: 'The porter’s lodge. The axe is there, under the bench, as if it had been waiting for me.',
      doorLabel: 'The fourth floor. The bell.',
      choicePrompt: 'Step 730. A thin bell hangs on the door. My hand is already rising.',
      options: [
        { k: 'defy', t: 'Ring the bell. Prove to yourself that you are extraordinary.',
          out: ['The bell makes a small tin sound. I will hear it for the rest of my life.', 'The theory was right about one thing: I stepped over. It never said what was on the other side of the line. On the other side was only me.'] },
        { k: 'obey', t: 'Put the axe back. Be an ordinary man, and hate yourself for it.',
          out: ['I return the axe to the lodge. The porter never looks up.', 'I am not Napoleon. I am a louse who knows he is a louse. The theory goes on without me, looking for someone braver.'] },
        { k: 'love', t: 'Go to Sonya’s room instead. Ask her to read aloud about Lazarus.',
          out: ['She reads badly, trembling, as if it were happening now.', 'Come out, it says. I do not come out. Not yet. But I learn that a door can be opened from the inside.'] }
      ],
      collapse: 'The heat closed over me like a coat. The bell rang by itself.'
    },

    underground: {
      title: 'The Cellar',
      work: 'after Notes from Underground',
      year: 1864,
      when: 'St Petersburg · 1864, a basement',
      az: 'Az. 1864/III-01',
      intro: [
        'I am a sick man. I am a spiteful man. I have lived in this hole for forty years. So have you.',
        'One wall is made of reason. It says that twice two makes four, and it is coming closer.',
        'The other wall is only a wall. It is coming closer too.'
      ],
      hint: 'The walls are moving. Reach what you need before they meet.',
      stoveLabel: 'Reach behind the stove',
      stove: 'Behind the stove, where the mice live, there is a warm brick. I put my hand on it and do not take it away.',
      liza: 'Liza’s footsteps on the stairs, going down. I could call out. I have been practising calling out for years.',
      mirror: 'In the mirror, a clerk. I insult him. He insults me back, with better timing.',
      wallLabel: 'Face the wall of reason',
      choicePrompt: 'Twice two makes four. The stone says it without malice. That is what makes it unbearable.',
      options: [
        { k: 'defy', t: 'Say it: twice two makes five. Because you want it to.',
          out: ['I say it. The wall does not move. But neither do I, and for a moment we are equals.', 'A man will choose madness over arithmetic just to prove he is not a piano key. I have proved it. I am alone with the proof.'] },
        { k: 'obey', t: 'Say it: twice two makes four. The wall is the wall.',
          out: ['I say it. The wall is satisfied. It stops a hand’s breadth from my face.', 'I live there, in the hand’s breadth, very comfortably, for the rest of my life.'] },
        { k: 'love', t: 'Run after Liza before she reaches the street.',
          out: ['I leave the cellar. The stairs are longer than I remembered.', 'I do not catch her. But for the first time in forty years I am outside, calling someone’s name.'] }
      ],
      collapse: 'The walls met, reason and the other one. I was the mortar.'
    }
  };
})();
