---
title: Gull Race
tagline: A pelican's payload of high-speed coastal racing.
status: in-development
jam: GMTK 2025
releasedAt: 2025-08-20
updatedAt: 2025-08-24
cover: /media/games/gull-race/cover.png
links:
  - label: itch.io
    url: https://itch.io
tags:
  - racing
  - arcade
  - gmtk
---

Gull Race is a breakneck arcade racer where you **are** the seagull — swooping, drafting, and dive-bombing rival birds for the last chip on the boardwalk.

Built in **Unity** over a single weekend for the 2025 GMTK jam, with the theme _"roles reversed"_: the gulls chase _you_.

## What works so far

- Hand-tuned wing physics and a camera that swings with each dive.
- A full loop: countdown → three laps → podium.
- Rival gulls that hold a grudge after you steal from them.

## Controls

| Input     | Action     |
| --------- | ---------- |
| `A` / `D` | steer      |
| `Space`   | dive       |
| `E`       | steal chip |

```csharp
// the one method the whole game hangs off
void Dive(Vector3 target) => velocity += (target - transform.position).normalized * diveForce;
```
