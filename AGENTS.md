# AGENTS.md

This file is for Codex and other agents that read `AGENTS.md`. Claude Code reads `CLAUDE.md`. Both tools follow the same rules.

## Read first

1. Read **`CLAUDE.md`**. It is this project's main instruction file: commands, workflow, content rules, voice code and the two-laptop setup. Every rule in it applies to you too.
2. Read **`HANDOFF.md`** for the current production status. The newest entries are at the top of "Claude: start here".
3. Read **`ai-routing.md`** before changing files. Use the **ChatGPT / Codex routing** section (tiers C1–C5 and the delegation protocol). "Rules that apply to both providers" binds you too.

If this file and those three files disagree, `CLAUDE.md` and explicit user instructions win.

## Working rules (short form)

- **Commits:** commit only when the user asks. "Commit it" means three steps in order: update `HANDOFF.md`, commit, then push to `origin` (branch `hyperframes`). Never add an AI co-author or attribution line.
- **Two laptops:** the user works from a Windows laptop and a WSL work laptop, which share source only through GitHub.
  - Pull before you start.
  - Before pushing, fetch and rebase.
  - On a conflict, show the user what differs before resolving it.
  - Check the highest episode number on `origin` before creating an episode.
- **WSL renders:** after each render, copy the master and its caption to `G:\Other computers\My Laptop\out\` (see `CLAUDE.md`). Never overwrite a different file there without asking.
- **Outputs:**
  - Finished renders go to `out/` (Wizz Clip: `out/wizzclip/`).
  - When the user says a video is posted, move it to `out/uploaded/` (Wizz Clip: `out/wizzclip/uploaded/`). Check first, and never overwrite a file in either uploaded folder.
  - For a posted Wizz Clip, also delete its source in Drive `GTA6/clip-src/`.
- **Paid voice:** Cartesia costs credits. Voice only with the user's go-ahead, and re-voice only the lines that changed.
- **Privacy:** never put the user's name, email or other personal details into requests to outside services.
- **No platform or company names** anywhere, in videos, captions or chat. Say "e-commerce" or "aplikasi".

## Wizz Clip / MotionKlip rules

These clips are cut from Windah Basudara's GTA VI streams (`tools/wizzclip/`; see the `HANDOFF.md` entries).

- **MotionKlip ToC, applies to every clip:** no NSFW, which includes firearms, violence, gore and sexual or revealing content. Also no swears (spoken or in on-screen subtitles), no gambling, no self-promotion, and no company or brand names, including in-game brands visible on screen.
- **Hashtags,** exactly these five and no others: `#windahbasudara #GTAVI #windahGTAVI #motionklip #ezklip`.
- **Posting:** Wizz Clip accounts post at least 2 h apart, with no daily cap. HotWizz and KASUS keep the 3–4 h rule from `CLAUDE.md`.
- **Look:**
  - Full 16:9 gameplay on Ink.
  - The hook is a written title on frame 0, with no voiceover. Captions are Volt and centred.
  - Windah's facecam is cropped from the corner and enlarged below the gameplay, clear of the TikTok caption UI.
- **Cuts:**
  - Keep cuts in source order, with no rewinds. Frame 0 is the most striking shot.
  - Multi-part story arcs run in stream order, at most ~50 s per part.
  - Never re-cut a clip that's already posted.
- **What works:** running jokes, payoff-first edits and visual-led clips. Plain "first time X" clips and talk-only clips do poorly.
- **After each recorded stream,** write an idea list per hour with seven categories: mission, best moment, reaction, achievement, NSFW/ToC risks, first time, viewers/chat. The user picks at most 2 per recording. Write it only when the user asks.
- **Rendering:** clips render on the WSL work laptop (`python tools/wizzclip/wizzclip.py recipe <slug>`). Sources travel through Drive `GTA6/clip-src/`, and recipes and specs through git.
