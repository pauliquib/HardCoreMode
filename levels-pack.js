(function (global) {
    'use strict';
    /** Vygenerováno editorem — Uložit do projektu */
    global.HC_LEVELS_PACK = {
    "easy": {
        "id": "easy",
        "label": "Easy",
        "tagline": "Tréninková zóna — pomalá láva, široké plošiny",
        "theme": {
            "bg": "#000014",
            "lavaTop": "rgba(80,200,220,0.92)",
            "lavaMid": "rgba(30,120,160,0.88)",
            "lavaBot": "#061018",
            "lavaLine": "rgba(160,240,255,0.55)",
            "solid": "#1e3a48",
            "solidStroke": "#3a6a7a",
            "crumbleCool": "#6ab8c8",
            "crumbleWarm": "#3a9aaa",
            "crumbleHot": "#2a8898",
            "spike": "#4a8898",
            "mover": "#5ec8e8",
            "moverGlow": "#40a0c0",
            "pulseOn": "rgba(28,113,216,0.7)",
            "pulseOff": "rgba(153,193,241,0.12)",
            "pulseStrokeOn": "rgba(140,240,255,0.85)",
            "pulseStrokeOff": "rgba(80,160,180,0.3)",
            "goalFill": "rgba(80,220,200,0.28)",
            "goalStroke": "#5ec8b0",
            "player": "#e8f8ff",
            "playerStroke": "#1a2830",
            "overlayAccent": "#5ec8e8",
            "hudDanger": "#ff6b6b",
            "pickup_speed": "#ffe066",
            "pickup_speedGlow": "#ffd700",
            "pickup_jump": "#66e0ff",
            "pickup_jumpGlow": "#00b8e8",
            "pickup_shield": "#88bbff",
            "pickup_shieldGlow": "#4488ff",
            "pickup_low_gravity": "#c088ff",
            "pickup_low_gravityGlow": "#9040e0",
            "pickup_lava_slow": "#ff9955",
            "pickup_lava_slowGlow": "#ff5500",
            "pickup_pulse_off": "#66ff99",
            "pickup_pulse_offGlow": "#22cc55",
            "pickup_mirror_move": "#ff66cc",
            "pickup_mirror_moveGlow": "#ff0088",
            "pickup_flip_scene": "#cccccc",
            "pickup_flip_sceneGlow": "#ffffff",
            "pickup_player_size": "#ffb366",
            "pickup_player_sizeGlow": "#ff8833"
        },
        "sectors": [
            {
                "name": "Vítej",
                "lavaSpeed": 14,
                "lavaStartOffset": 130,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 180,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    },
                    {
                        "x": 392,
                        "y": 281,
                        "w": 453,
                        "h": 16
                    },
                    {
                        "x": 724,
                        "y": 137,
                        "w": 76,
                        "h": 17
                    }
                ],
                "crumble": [
                    {
                        "x": 190,
                        "y": 438,
                        "w": 76,
                        "h": 11,
                        "crumbleWhen": "leave",
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 305,
                        "y": 404,
                        "w": 72,
                        "h": 11,
                        "crumbleWhen": "leave",
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 412,
                        "y": 366,
                        "w": 68,
                        "h": 11,
                        "crumbleWhen": "leave",
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 277,
                        "y": 329,
                        "w": 64,
                        "h": 11,
                        "crumbleWhen": "leave",
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 682,
                        "y": 214,
                        "w": 86,
                        "h": 13,
                        "crumbleWhen": "leave",
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 556,
                        "y": 195,
                        "w": 89,
                        "h": 13,
                        "crumbleWhen": "leave",
                        "blocksPlayer": true,
                        "killOnContact": false
                    }
                ],
                "spikes": [],
                "movers": [],
                "pulses": [
                    {
                        "x": 392,
                        "y": 297,
                        "w": 451,
                        "h": 7,
                        "period": 1.2,
                        "phase": 0
                    }
                ]
            },
            {
                "name": "Dvojskok",
                "lavaSpeed": 18,
                "lavaStartOffset": 112,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 180,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    },
                    {
                        "x": 442,
                        "y": 313,
                        "w": 155,
                        "h": 18
                    }
                ],
                "crumble": [
                    {
                        "x": 212,
                        "y": 418,
                        "w": 56,
                        "h": 11,
                        "crumbleWhen": "leave",
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 303,
                        "y": 386,
                        "w": 52,
                        "h": 11,
                        "crumbleWhen": "leave",
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 387,
                        "y": 353,
                        "w": 48,
                        "h": 11,
                        "crumbleWhen": "leave",
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 369,
                        "y": 226,
                        "w": 66,
                        "h": 17,
                        "crumbleWhen": "leave",
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 491,
                        "y": 167,
                        "w": 98,
                        "h": 16,
                        "crumbleWhen": "leave",
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 599,
                        "y": 87,
                        "w": 65,
                        "h": 18,
                        "crumbleWhen": "leave",
                        "blocksPlayer": true,
                        "killOnContact": false
                    }
                ],
                "spikes": [],
                "movers": [],
                "pulses": []
            },
            {
                "name": "Ostražitě",
                "lavaSpeed": 20,
                "lavaStartOffset": 104,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 820,
                    "y": 43,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 180,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    },
                    {
                        "x": 267,
                        "y": 316,
                        "w": 66,
                        "h": 15
                    },
                    {
                        "x": 148,
                        "y": 189,
                        "w": 330,
                        "h": 17
                    },
                    {
                        "x": 528,
                        "y": 188,
                        "w": 170,
                        "h": 21
                    }
                ],
                "crumble": [
                    {
                        "x": 186,
                        "y": 409,
                        "w": 237,
                        "h": 12,
                        "crumbleWhen": "leave",
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 68,
                        "y": 251,
                        "w": 195,
                        "h": 18,
                        "crumbleWhen": "leave",
                        "blocksPlayer": true,
                        "killOnContact": false
                    }
                ],
                "spikes": [
                    {
                        "x": 780,
                        "y": 140,
                        "w": 54,
                        "h": 23
                    }
                ],
                "movers": [],
                "pulses": [
                    {
                        "x": 475,
                        "y": 106,
                        "w": 53,
                        "h": 107,
                        "period": 1.2,
                        "phase": 0,
                        "blocksPlayer": false,
                        "killOnContact": true
                    }
                ]
            },
            {
                "name": "Vlny",
                "lavaSpeed": 22,
                "lavaStartOffset": 96,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 180,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    },
                    {
                        "x": 576,
                        "y": 243,
                        "w": 244,
                        "h": 19,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 666,
                        "y": 155,
                        "w": 79,
                        "h": 15,
                        "blocksPlayer": true,
                        "killOnContact": false
                    }
                ],
                "crumble": [],
                "spikes": [],
                "movers": [
                    {
                        "x": 365,
                        "y": 440,
                        "w": 180,
                        "h": 15,
                        "amp": 200,
                        "spd": 0.5,
                        "phase": 20,
                        "axis": "x",
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 615,
                        "y": 362,
                        "w": 180,
                        "h": 15,
                        "amp": 200,
                        "spd": 0.5,
                        "phase": 0,
                        "axis": "x",
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 216,
                        "y": 292,
                        "w": 180,
                        "h": 15,
                        "amp": 200,
                        "spd": 0.5,
                        "phase": 70,
                        "axis": "x",
                        "blocksPlayer": true,
                        "killOnContact": false
                    }
                ],
                "pulses": []
            },
            {
                "name": "Inteligence",
                "lavaSpeed": 24,
                "lavaStartOffset": 88,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 180,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    },
                    {
                        "x": 212,
                        "y": 417,
                        "w": 229,
                        "h": 18,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 461,
                        "y": 357,
                        "w": 221,
                        "h": 19,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 708,
                        "y": 308,
                        "w": 166,
                        "h": 18,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 509,
                        "y": 254,
                        "w": 152,
                        "h": 19,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 372,
                        "y": 217,
                        "w": 126,
                        "h": 16,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 532,
                        "y": 150,
                        "w": 104,
                        "h": 21,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 708,
                        "y": 125,
                        "w": 163,
                        "h": 16,
                        "blocksPlayer": true,
                        "killOnContact": false
                    }
                ],
                "crumble": [],
                "spikes": [
                    {
                        "x": 717,
                        "y": 433,
                        "w": 33,
                        "h": 23,
                        "blocksPlayer": false,
                        "killOnContact": true,
                        "reactPlayer": true,
                        "reactMult": 0.5,
                        "reactDir": "away",
                        "reactMode": "mirror",
                        "reactAxis": "both",
                        "reactOffsetX": 0,
                        "reactOffsetY": 0,
                        "reactPerpAmp": 0,
                        "reactPerpFreq": 0.05,
                        "reactPerpPhase": 0,
                        "reactMaxDist": 120,
                        "reactMinDist": 0,
                        "reactRange": 0
                    },
                    {
                        "x": 132,
                        "y": 4,
                        "w": 140,
                        "h": 204,
                        "blocksPlayer": false,
                        "killOnContact": true,
                        "reactPlayer": true,
                        "reactMult": 0.5,
                        "reactDir": "away",
                        "reactMode": "mirror",
                        "reactAxis": "both",
                        "reactOffsetX": 0,
                        "reactOffsetY": 0,
                        "reactPerpAmp": 0,
                        "reactPerpFreq": 0.05,
                        "reactPerpPhase": 0,
                        "reactMaxDist": 120,
                        "reactMinDist": 0,
                        "reactRange": 0
                    },
                    {
                        "x": 650,
                        "y": 29,
                        "w": 16,
                        "h": 101,
                        "blocksPlayer": false,
                        "killOnContact": true,
                        "reactPlayer": true,
                        "reactMult": 0.5,
                        "reactDir": "away",
                        "reactMode": "mirror",
                        "reactAxis": "both",
                        "reactOffsetX": 0,
                        "reactOffsetY": 0,
                        "reactPerpAmp": 0,
                        "reactPerpFreq": 0.05,
                        "reactPerpPhase": 0,
                        "reactMaxDist": 120,
                        "reactMinDist": 0,
                        "reactRange": 0
                    },
                    {
                        "x": 373,
                        "y": 396,
                        "w": 52,
                        "h": 36,
                        "blocksPlayer": false,
                        "killOnContact": true,
                        "reactPlayer": true,
                        "reactMult": 0.5,
                        "reactDir": "away",
                        "reactMode": "mirror",
                        "reactAxis": "both",
                        "reactOffsetX": 0,
                        "reactOffsetY": 0,
                        "reactPerpAmp": 0,
                        "reactPerpFreq": 0.05,
                        "reactPerpPhase": 0,
                        "reactMaxDist": 120,
                        "reactMinDist": 0,
                        "reactRange": 0
                    }
                ],
                "movers": [],
                "pulses": []
            },
            {
                "name": "Opačně",
                "lavaSpeed": 26,
                "lavaStartOffset": 80,
                "spawn": {
                    "x": 65,
                    "y": 259
                },
                "goal": {
                    "x": 810,
                    "y": 274,
                    "w": 44,
                    "h": 40,
                    "blocksPlayer": false,
                    "killOnContact": false
                },
                "solids": [
                    {
                        "x": -1,
                        "y": 279,
                        "w": 180,
                        "h": 40,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 136,
                        "y": 51,
                        "w": 197,
                        "h": 30,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 589,
                        "y": 347,
                        "w": 123,
                        "h": 25,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 517,
                        "y": 201,
                        "w": 98,
                        "h": 23,
                        "blocksPlayer": true,
                        "killOnContact": false
                    }
                ],
                "crumble": [
                    {
                        "x": 360,
                        "y": 113,
                        "w": 39,
                        "h": 21,
                        "blocksPlayer": true,
                        "killOnContact": false,
                        "crumbleWhen": "touch"
                    },
                    {
                        "x": 431,
                        "y": 150,
                        "w": 55,
                        "h": 29,
                        "blocksPlayer": true,
                        "killOnContact": false,
                        "crumbleWhen": "touch"
                    }
                ],
                "spikes": [],
                "movers": [],
                "pulses": [],
                "pickups": [
                    {
                        "x": 178,
                        "y": 205,
                        "w": 14,
                        "h": 14,
                        "effectType": "flip_scene",
                        "strength": 1,
                        "duration": 4,
                        "blocksPlayer": false,
                        "killOnContact": false,
                        "flipGravity": true
                    },
                    {
                        "x": 532,
                        "y": 228,
                        "w": 14,
                        "h": 14,
                        "effectType": "mirror_move",
                        "strength": 1.5,
                        "duration": 4,
                        "blocksPlayer": false,
                        "killOnContact": false,
                        "flipGravity": true
                    }
                ]
            },
            {
                "name": "Východ z pekla",
                "lavaSpeed": 28,
                "lavaStartOffset": 72,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 180,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 212,
                        "y": 424,
                        "w": 26,
                        "h": 15,
                        "blocksPlayer": true,
                        "killOnContact": false,
                        "crumbleWhen": "touch"
                    },
                    {
                        "x": 259,
                        "y": 395,
                        "w": 26,
                        "h": 15,
                        "blocksPlayer": true,
                        "killOnContact": false,
                        "crumbleWhen": "touch"
                    },
                    {
                        "x": 310,
                        "y": 362,
                        "w": 26,
                        "h": 15,
                        "blocksPlayer": true,
                        "killOnContact": false,
                        "crumbleWhen": "touch"
                    },
                    {
                        "x": 411,
                        "y": 359,
                        "w": 26,
                        "h": 15,
                        "blocksPlayer": true,
                        "killOnContact": false,
                        "crumbleWhen": "touch"
                    },
                    {
                        "x": 466,
                        "y": 314,
                        "w": 26,
                        "h": 15,
                        "blocksPlayer": true,
                        "killOnContact": false,
                        "crumbleWhen": "touch"
                    },
                    {
                        "x": 513,
                        "y": 294,
                        "w": 24,
                        "h": 15,
                        "blocksPlayer": true,
                        "killOnContact": false,
                        "crumbleWhen": "touch"
                    },
                    {
                        "x": 558,
                        "y": 237,
                        "w": 26,
                        "h": 15,
                        "blocksPlayer": true,
                        "killOnContact": false,
                        "crumbleWhen": "touch"
                    },
                    {
                        "x": 597,
                        "y": 199,
                        "w": 26,
                        "h": 15,
                        "blocksPlayer": true,
                        "killOnContact": false,
                        "crumbleWhen": "touch"
                    },
                    {
                        "x": 670,
                        "y": 140,
                        "w": 26,
                        "h": 15,
                        "blocksPlayer": true,
                        "killOnContact": false,
                        "crumbleWhen": "touch"
                    },
                    {
                        "x": 755,
                        "y": 104,
                        "w": 26,
                        "h": 15,
                        "blocksPlayer": true,
                        "killOnContact": false,
                        "crumbleWhen": "touch"
                    }
                ],
                "spikes": [],
                "movers": [],
                "pulses": []
            }
        ]
    },
    "medium": {
        "id": "medium",
        "label": "Medium",
        "tagline": "Ohnivá jáma — klasická obtížnost",
        "theme": {
            "bg": "#08080d",
            "lavaTop": "rgba(255,60,30,0.95)",
            "lavaMid": "rgba(180,20,10,0.9)",
            "lavaBot": "#1a0505",
            "lavaLine": "rgba(255,200,80,0.5)",
            "solid": "#2a2a38",
            "solidStroke": "#4a4a5c",
            "crumbleCool": "#b4642d",
            "crumbleWarm": "#d05020",
            "crumbleHot": "#ff3d1f",
            "spike": "#c41e1e",
            "mover": "#ff2244",
            "moverGlow": "#ff0000",
            "pulseOn": "rgba(255,0,60,0.75)",
            "pulseOff": "rgba(60,255,120,0.15)",
            "pulseStrokeOn": "rgba(255,100,120,0.9)",
            "pulseStrokeOff": "rgba(100,200,140,0.35)",
            "goalFill": "rgba(80,220,160,0.25)",
            "goalStroke": "#3ecf8e",
            "player": "#f4f2ef",
            "playerStroke": "#1a1a22",
            "overlayAccent": "#ff2d2d",
            "hudDanger": "#ff2d2d",
            "pickup_speed": "#ffe066",
            "pickup_speedGlow": "#ffd700",
            "pickup_jump": "#66e0ff",
            "pickup_jumpGlow": "#00b8e8",
            "pickup_shield": "#88bbff",
            "pickup_shieldGlow": "#4488ff",
            "pickup_low_gravity": "#c088ff",
            "pickup_low_gravityGlow": "#9040e0",
            "pickup_lava_slow": "#ff9955",
            "pickup_lava_slowGlow": "#ff5500",
            "pickup_pulse_off": "#66ff99",
            "pickup_pulse_offGlow": "#22cc55",
            "pickup_mirror_move": "#ff66cc",
            "pickup_mirror_moveGlow": "#ff0088",
            "pickup_flip_scene": "#cccccc",
            "pickup_flip_sceneGlow": "#ffffff",
            "pickup_player_size": "#ffb366",
            "pickup_player_sizeGlow": "#ff8833"
        },
        "sectors": [
            {
                "name": "Křehký rozjezd",
                "lavaSpeed": 10,
                "lavaStartOffset": 10000000,
                "spawn": {
                    "x": 41,
                    "y": 50
                },
                "goal": {
                    "x": 833,
                    "y": 468,
                    "w": 25,
                    "h": 48,
                    "blocksPlayer": false,
                    "killOnContact": false
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 68,
                        "w": 769,
                        "h": 13,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 158,
                        "y": 129,
                        "w": 721,
                        "h": 12,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 197,
                        "y": 315,
                        "w": 199,
                        "h": 16,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 25,
                        "y": 174,
                        "w": 127,
                        "h": 8,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 2,
                        "y": 237,
                        "w": 38,
                        "h": 87,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 94,
                        "y": 297,
                        "w": 57,
                        "h": 10,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 3,
                        "y": 388,
                        "w": 234,
                        "h": 11,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 358,
                        "y": 171,
                        "w": 39,
                        "h": 144,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 287,
                        "y": 254,
                        "w": 57,
                        "h": 11,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 327,
                        "y": 170,
                        "w": 17,
                        "h": 14,
                        "blocksPlayer": true,
                        "killOnContact": false
                    },
                    {
                        "x": 450,
                        "y": 228,
                        "w": 351,
                        "h": 15,
                        "blocksPlayer": true,
                        "killOnContact": false
                    }
                ],
                "crumble": [
                    {
                        "x": 3,
                        "y": 126,
                        "w": 56,
                        "h": 11,
                        "blocksPlayer": true,
                        "killOnContact": false,
                        "crumbleWhen": "touch"
                    },
                    {
                        "x": 281,
                        "y": 390,
                        "w": 87,
                        "h": 13,
                        "blocksPlayer": true,
                        "killOnContact": false,
                        "crumbleWhen": "leave"
                    },
                    {
                        "x": 428,
                        "y": 390,
                        "w": 32,
                        "h": 17,
                        "blocksPlayer": true,
                        "killOnContact": false,
                        "crumbleWhen": "leave"
                    },
                    {
                        "x": 503,
                        "y": 336,
                        "w": 28,
                        "h": 21,
                        "blocksPlayer": true,
                        "killOnContact": false,
                        "crumbleWhen": "leave"
                    },
                    {
                        "x": 563,
                        "y": 292,
                        "w": 31,
                        "h": 18,
                        "blocksPlayer": true,
                        "killOnContact": false,
                        "crumbleWhen": "leave"
                    },
                    {
                        "x": 637,
                        "y": 373,
                        "w": 149,
                        "h": 22,
                        "blocksPlayer": true,
                        "killOnContact": false,
                        "crumbleWhen": "leave"
                    }
                ],
                "spikes": [
                    {
                        "x": -61,
                        "y": 513,
                        "w": 880,
                        "h": 127,
                        "blocksPlayer": false,
                        "killOnContact": true
                    },
                    {
                        "x": 817,
                        "y": 390,
                        "w": 25,
                        "h": 25,
                        "blocksPlayer": false,
                        "killOnContact": true
                    },
                    {
                        "x": 608,
                        "y": 414,
                        "w": 25,
                        "h": 25,
                        "blocksPlayer": false,
                        "killOnContact": true
                    },
                    {
                        "x": 152,
                        "y": 313,
                        "w": 25,
                        "h": 25,
                        "blocksPlayer": false,
                        "killOnContact": true
                    },
                    {
                        "x": 416,
                        "y": 284,
                        "w": 25,
                        "h": 25,
                        "blocksPlayer": false,
                        "killOnContact": true
                    },
                    {
                        "x": 93,
                        "y": 136,
                        "w": 25,
                        "h": 25,
                        "blocksPlayer": false,
                        "killOnContact": true
                    },
                    {
                        "x": 681,
                        "y": 259,
                        "w": 25,
                        "h": 25,
                        "blocksPlayer": false,
                        "killOnContact": true
                    },
                    {
                        "x": 0,
                        "y": -4,
                        "w": 880,
                        "h": 16,
                        "blocksPlayer": false,
                        "killOnContact": true
                    },
                    {
                        "x": 73,
                        "y": 308,
                        "w": 13,
                        "h": 11,
                        "blocksPlayer": false,
                        "killOnContact": true
                    }
                ],
                "movers": [
                    {
                        "x": 696,
                        "y": 97,
                        "w": 13,
                        "h": 48,
                        "amp": 30,
                        "spd": 1,
                        "phase": 0,
                        "axis": "y",
                        "blocksPlayer": false,
                        "killOnContact": true
                    },
                    {
                        "x": 423,
                        "y": 51,
                        "w": 13,
                        "h": 31,
                        "amp": 30,
                        "spd": 1,
                        "phase": 0,
                        "axis": "y",
                        "blocksPlayer": false,
                        "killOnContact": true
                    },
                    {
                        "x": 236,
                        "y": 49,
                        "w": 17,
                        "h": 21,
                        "amp": 30,
                        "spd": 1,
                        "phase": 0,
                        "axis": "y",
                        "blocksPlayer": false,
                        "killOnContact": true
                    },
                    {
                        "x": 296,
                        "y": 116,
                        "w": 17,
                        "h": 29,
                        "amp": 30,
                        "spd": 1,
                        "phase": 0,
                        "axis": "y",
                        "blocksPlayer": false,
                        "killOnContact": true
                    },
                    {
                        "x": 124,
                        "y": 38,
                        "w": 11,
                        "h": 21,
                        "amp": 30,
                        "spd": 1,
                        "phase": 0,
                        "axis": "y",
                        "blocksPlayer": false,
                        "killOnContact": true
                    }
                ],
                "pulses": [
                    {
                        "x": 93,
                        "y": 182,
                        "w": 18,
                        "h": 113,
                        "period": 4,
                        "phase": 0,
                        "blocksPlayer": false,
                        "killOnContact": true
                    },
                    {
                        "x": 198,
                        "y": 299,
                        "w": 149,
                        "h": 15,
                        "period": 3,
                        "phase": 0,
                        "blocksPlayer": false,
                        "killOnContact": true
                    },
                    {
                        "x": 419,
                        "y": 174,
                        "w": 12,
                        "h": 58,
                        "period": 5,
                        "phase": 0,
                        "blocksPlayer": false,
                        "killOnContact": true
                    },
                    {
                        "x": 622,
                        "y": 210,
                        "w": 256,
                        "h": 18,
                        "period": 3,
                        "phase": 0,
                        "blocksPlayer": false,
                        "killOnContact": true
                    },
                    {
                        "x": 689,
                        "y": 310,
                        "w": 182,
                        "h": 13,
                        "period": 6,
                        "phase": 0,
                        "blocksPlayer": false,
                        "killOnContact": true
                    },
                    {
                        "x": 424,
                        "y": 335,
                        "w": 201,
                        "h": 12,
                        "period": 1.2,
                        "phase": 0,
                        "blocksPlayer": false,
                        "killOnContact": true
                    },
                    {
                        "x": 331,
                        "y": 330,
                        "w": 15,
                        "h": 99,
                        "period": 1.2,
                        "phase": 0,
                        "blocksPlayer": false,
                        "killOnContact": true
                    }
                ],
                "public": true,
                "pickups": [
                    {
                        "x": 65,
                        "y": 38,
                        "w": 23,
                        "h": 28,
                        "effectType": "speed",
                        "strength": 0.001,
                        "duration": 100000,
                        "blocksPlayer": false,
                        "killOnContact": false
                    },
                    {
                        "x": 20,
                        "y": 356,
                        "w": 28,
                        "h": 26,
                        "effectType": "shield",
                        "strength": 100,
                        "duration": 10,
                        "blocksPlayer": false,
                        "killOnContact": false
                    }
                ]
            },
            {
                "name": "Kyvadla",
                "lavaSpeed": 30,
                "lavaStartOffset": 112,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 400,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 358,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 316,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Pulzní mříž",
                "lavaSpeed": 32,
                "lavaStartOffset": 104,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 362,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 320,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 278,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Vertikální řez",
                "lavaSpeed": 34,
                "lavaStartOffset": 96,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 324,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 282,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 240,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Ohnivý žlab",
                "lavaSpeed": 36,
                "lavaStartOffset": 88,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 286,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 244,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 202,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Jádro",
                "lavaSpeed": 38,
                "lavaStartOffset": 80,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 248,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 206,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 164,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Poslední brána",
                "lavaSpeed": 40,
                "lavaStartOffset": 72,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 210,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 168,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 126,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            }
        ]
    },
    "hard": {
        "id": "hard",
        "label": "Hard",
        "tagline": "Temnota — rychlejší láva, pulzní pasti",
        "theme": {
            "bg": "#0a0812",
            "lavaTop": "rgba(180,40,255,0.92)",
            "lavaMid": "rgba(100,10,160,0.88)",
            "lavaBot": "#120818",
            "lavaLine": "rgba(220,140,255,0.5)",
            "solid": "#2a2038",
            "solidStroke": "#4a3860",
            "crumbleCool": "#6a4088",
            "crumbleWarm": "#8830a8",
            "crumbleHot": "#b020d0",
            "spike": "#9018a0",
            "mover": "#d040ff",
            "moverGlow": "#a020e0",
            "reactor": "#60e8ff",
            "reactorGlow": "#30b8e0",
            "pulseOn": "rgba(200,60,255,0.78)",
            "pulseOff": "rgba(80,40,120,0.15)",
            "pulseStrokeOn": "rgba(240,140,255,0.9)",
            "pulseStrokeOff": "rgba(120,80,160,0.35)",
            "goalFill": "rgba(160,100,255,0.22)",
            "goalStroke": "#a060e8",
            "pickup_speed": "#ffe066",
            "pickup_speedGlow": "#ffd700",
            "pickup_jump": "#66e0ff",
            "pickup_jumpGlow": "#00b8e8",
            "pickup_shield": "#88bbff",
            "pickup_shieldGlow": "#4488ff",
            "pickup_low_gravity": "#c088ff",
            "pickup_low_gravityGlow": "#9040e0",
            "pickup_lava_slow": "#ff9955",
            "pickup_lava_slowGlow": "#ff5500",
            "pickup_pulse_off": "#66ff99",
            "pickup_pulse_offGlow": "#22cc55",
            "pickup_mirror_move": "#ff66cc",
            "pickup_mirror_moveGlow": "#ff0088",
            "pickup_flip_scene": "#cccccc",
            "pickup_flip_sceneGlow": "#ffffff",
            "pickup_player_size": "#ffb366",
            "pickup_player_sizeGlow": "#ff8833",
            "player": "#f0e8ff",
            "playerStroke": "#1a1028",
            "overlayAccent": "#b040ff",
            "hudDanger": "#ff4080"
        },
        "sectors": [
            {
                "name": "Stínový průchod",
                "lavaSpeed": 34,
                "lavaStartOffset": 120,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 438,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 396,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 354,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Dvojité kyvadlo",
                "lavaSpeed": 36,
                "lavaStartOffset": 112,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 400,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 358,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 316,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Fialová síť",
                "lavaSpeed": 38,
                "lavaStartOffset": 104,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 362,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 320,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 278,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Propast bez milosti",
                "lavaSpeed": 40,
                "lavaStartOffset": 96,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 324,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 282,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 240,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Synchronní pulz",
                "lavaSpeed": 42,
                "lavaStartOffset": 88,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 286,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 244,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 202,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Úzké jádro",
                "lavaSpeed": 44,
                "lavaStartOffset": 80,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 248,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 206,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 164,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Temnota končí",
                "lavaSpeed": 46,
                "lavaStartOffset": 72,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 210,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 168,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 126,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            }
        ]
    },
    "hardcore": {
        "id": "hardcore",
        "label": "Hardcore",
        "tagline": "Inferno — kombinované pasti",
        "theme": {
            "bg": "#0c0606",
            "lavaTop": "rgba(255,20,0,0.97)",
            "lavaMid": "rgba(140,0,0,0.94)",
            "lavaBot": "#180202",
            "lavaLine": "rgba(255,120,40,0.65)",
            "solid": "#301818",
            "solidStroke": "#502828",
            "crumbleCool": "#883020",
            "crumbleWarm": "#b82010",
            "crumbleHot": "#ff1800",
            "spike": "#e01010",
            "mover": "#ff3010",
            "moverGlow": "#ff0000",
            "reactor": "#ffaa00",
            "reactorGlow": "#ff6600",
            "pulseOn": "rgba(255,40,0,0.85)",
            "pulseOff": "rgba(80,20,10,0.18)",
            "pulseStrokeOn": "rgba(255,100,40,0.95)",
            "pulseStrokeOff": "rgba(120,40,20,0.4)",
            "goalFill": "rgba(255,120,40,0.2)",
            "goalStroke": "#ff6020",
            "pickup_speed": "#ffe066",
            "pickup_speedGlow": "#ffd700",
            "pickup_jump": "#66e0ff",
            "pickup_jumpGlow": "#00b8e8",
            "pickup_shield": "#88bbff",
            "pickup_shieldGlow": "#4488ff",
            "pickup_low_gravity": "#c088ff",
            "pickup_low_gravityGlow": "#9040e0",
            "pickup_lava_slow": "#ff9955",
            "pickup_lava_slowGlow": "#ff5500",
            "pickup_pulse_off": "#66ff99",
            "pickup_pulse_offGlow": "#22cc55",
            "pickup_mirror_move": "#ff66cc",
            "pickup_mirror_moveGlow": "#ff0088",
            "pickup_flip_scene": "#cccccc",
            "pickup_flip_sceneGlow": "#ffffff",
            "pickup_player_size": "#ffb366",
            "pickup_player_sizeGlow": "#ff8833",
            "player": "#fff0e8",
            "playerStroke": "#220808",
            "overlayAccent": "#ff2000",
            "hudDanger": "#ff1800"
        },
        "sectors": [
            {
                "name": "Spalující start",
                "lavaSpeed": 42,
                "lavaStartOffset": 120,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 438,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 396,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 354,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Krvavé kyvadlo",
                "lavaSpeed": 44,
                "lavaStartOffset": 112,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 400,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 358,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 316,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Žhavá mříž",
                "lavaSpeed": 46,
                "lavaStartOffset": 104,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 362,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 320,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 278,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Vnitřní oheň",
                "lavaSpeed": 48,
                "lavaStartOffset": 96,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 324,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 282,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 240,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Pekelný žlab",
                "lavaSpeed": 50,
                "lavaStartOffset": 88,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 286,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 244,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 202,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Synchronní peklo",
                "lavaSpeed": 52,
                "lavaStartOffset": 80,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 248,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 206,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 164,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Brána inferna",
                "lavaSpeed": 54,
                "lavaStartOffset": 72,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 210,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 168,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 126,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            }
        ]
    },
    "bornForHell": {
        "id": "bornForHell",
        "label": "Born for Hell",
        "tagline": "Abaddon — maximální chaos",
        "theme": {
            "bg": "#040404",
            "lavaTop": "rgba(255,255,255,0.95)",
            "lavaMid": "rgba(200,0,0,0.95)",
            "lavaBot": "#0a0000",
            "lavaLine": "rgba(255,255,255,0.7)",
            "solid": "#181818",
            "solidStroke": "#303030",
            "crumbleCool": "#404040",
            "crumbleWarm": "#802020",
            "crumbleHot": "#ff0000",
            "spike": "#ffffff",
            "mover": "#ff0000",
            "moverGlow": "#ffffff",
            "reactor": "#ffcc00",
            "reactorGlow": "#ffffff",
            "pulseOn": "rgba(255,255,255,0.9)",
            "pulseOff": "rgba(60,0,0,0.2)",
            "pulseStrokeOn": "rgba(255,0,0,0.95)",
            "pulseStrokeOff": "rgba(80,0,0,0.45)",
            "goalFill": "rgba(255,0,0,0.25)",
            "goalStroke": "#ff0000",
            "pickup_speed": "#ffff44",
            "pickup_speedGlow": "#ffffaa",
            "pickup_jump": "#66e0ff",
            "pickup_jumpGlow": "#00b8e8",
            "pickup_shield": "#aaccff",
            "pickup_shieldGlow": "#ffffff",
            "pickup_low_gravity": "#c088ff",
            "pickup_low_gravityGlow": "#9040e0",
            "pickup_lava_slow": "#ff9955",
            "pickup_lava_slowGlow": "#ff5500",
            "pickup_pulse_off": "#66ff99",
            "pickup_pulse_offGlow": "#22cc55",
            "pickup_mirror_move": "#ff66cc",
            "pickup_mirror_moveGlow": "#ff0088",
            "pickup_flip_scene": "#cccccc",
            "pickup_flip_sceneGlow": "#ffffff",
            "pickup_player_size": "#ffb366",
            "pickup_player_sizeGlow": "#ff8833",
            "player": "#ffffff",
            "playerStroke": "#000000",
            "overlayAccent": "#ffffff",
            "hudDanger": "#ff0000"
        },
        "sectors": [
            {
                "name": "Nulová tolerance",
                "lavaSpeed": 52,
                "lavaStartOffset": 120,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 438,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 396,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 354,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Bílý oheň",
                "lavaSpeed": 54,
                "lavaStartOffset": 112,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 400,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 358,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 316,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Absolutní propast",
                "lavaSpeed": 56,
                "lavaStartOffset": 104,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 362,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 320,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 278,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Krvavý labyrint",
                "lavaSpeed": 58,
                "lavaStartOffset": 96,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 324,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 282,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 240,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Synchronní smrt",
                "lavaSpeed": 60,
                "lavaStartOffset": 88,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 286,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 244,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 202,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Poslední dech",
                "lavaSpeed": 62,
                "lavaStartOffset": 80,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 248,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 206,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 164,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            },
            {
                "name": "Abaddon",
                "lavaSpeed": 64,
                "lavaStartOffset": 72,
                "spawn": {
                    "x": 48,
                    "y": 465
                },
                "goal": {
                    "x": 792,
                    "y": 68,
                    "w": 44,
                    "h": 40
                },
                "solids": [
                    {
                        "x": 0,
                        "y": 480,
                        "w": 160,
                        "h": 40
                    },
                    {
                        "x": 780,
                        "y": 480,
                        "w": 100,
                        "h": 40
                    }
                ],
                "crumble": [
                    {
                        "x": 172,
                        "y": 210,
                        "w": 56,
                        "h": 11
                    },
                    {
                        "x": 250,
                        "y": 168,
                        "w": 52,
                        "h": 11
                    },
                    {
                        "x": 328,
                        "y": 126,
                        "w": 48,
                        "h": 11
                    }
                ],
                "spikes": [
                    {
                        "x": 160,
                        "y": 502,
                        "w": 620,
                        "h": 12
                    }
                ],
                "movers": [],
                "pulses": [],
                "pickups": [],
                "public": false
            }
        ]
    }
};
})(typeof window !== 'undefined' ? window : globalThis);
