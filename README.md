# Academic Profile Website

Personal academic portfolio website for **Bhaskar Malviya**.

The main landing-page display name is intentionally kept as **lnifelias stargarden**. Everywhere else, the site uses the real name **Bhaskar Malviya**.

## Live Website

[Visit the academic profile website](https://lnife.github.io/academic-profile/)

## Repository

[View the GitHub repository](https://github.com/lnife/academic-profile)

## Purpose

This website presents Bhaskar Malviya's academic background, research interests, computational chemistry experience, scientific computing projects, and contact information for research and PhD-related communication.

## Profile Highlights

- M.Sc. Chemistry, Indian Institute of Technology Madras
- Specialization in computational quantum chemistry
- Master's thesis on magnetically induced current-density analysis of aromatic, antiaromatic, and non-aromatic systems
- Experience with Gaussian, ORCA, GIMIC, Python, Rust, PyTorch, shell scripting, GROMACS, and Schrödinger/Maestro
- Independent projects in neural VMC-style quantum simulation and hydrogenic orbital visualization

## Tech Stack

- HTML
- CSS
- JavaScript

## Project Structure

```text
academic-profile/
├── .editorconfig
├── .gitattributes
├── .gitignore
├── .nojekyll
├── index.html
├── styles.css
├── script.js
└── README.md
```

## Local Preview

Open `index.html` directly in a browser, or run a small local server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deployment

For GitHub Pages, keep `index.html`, `styles.css`, and `script.js` in the
repository root. In the repository settings, enable Pages from the `main`
branch and use the root folder.

## Notes

The JavaScript has been adjusted to avoid unwanted hash-link jumps, reduce scroll/resize glitches from the animated canvas, and prevent mobile navigation from leaving the page scroll-locked.


## Stable scroll fix

This version fixes the earlier automatic downward scrolling by giving the canvas container a fixed responsive height and resizing the drawing buffer from `clientWidth/clientHeight` instead of the border-box size. This prevents a ResizeObserver feedback loop where the canvas kept making its parent taller.
