# UNCAFFEINATED - Snake Game

## App Title
**UNCAFFEINATED - Snake Game**

## Authorship & Attribution
Game and user interface development by **Aiden (A.J.) Ramsden**

## Resources
- [W3Schools](https://www.w3schools.com/)
  - [HTML](https://www.w3schools.com/html/default.asp)
  - [CSS](https://www.w3schools.com/css/default.asp)
  - [JavaScript](https://www.w3schools.com/js/default.asp)
  - [JavaScript Forms](https://www.w3schools.com/js/js_validation.asp)
  - [JavaScript Local Storage](https://www.w3schools.com/jsref/prop_win_localstorage.asp)
- [MDN Web Docs](https://developer.mozilla.org/)
  - [Constraint Validation API](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation)
  - [aria-live](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
- [Advanced CSS Selectors](https://www.w3.org/TR/selectors-4/)
  - [:nth-child(odd)](https://www.w3.org/TR/selectors-4/#the-nth-child-pseudo) selects odd-numbered list items.
  - [[target="_blank"]](https://www.w3schools.com/tags/att_a_target.asp) selects links that open in a new tab.
- [Bootstrap 5.3](https://getbootstrap.com/)
  - [Bootstrap Navbar](https://getbootstrap.com/docs/5.3/components/navbar/) is used for the top navigation bar in my Snake Game project.
- [WebAIM](https://webaim.org/)
- [WAVE Web Accessibility Evaluation Tool](https://wave.webaim.org/)
- [Nu HTML Checker](https://validator.w3.org/nu/)
- [Google Fonts](https://fonts.google.com/)

## Inspirations
- Classic Snake arcade games
  - [Classic Retro Snake Game (HTML, CSS, JS)](https://codeshack.io/classic-retro-snake-game-html-css-js/)
- Professor Barry Cumbie, Computer Information Systems, University of North Alabama
  - Used class concepts about semantic HTML, validation, accessibility, and responsive web design

## Libraries & Frameworks
- [Bootstrap 5.3.0](https://getbootstrap.com/)
  - Used Bootstrap for the responsive navbar, cards, modal leaderboard, buttons, table, and layout grid

## Assets
- Google Fonts
  - [DotGothic16](https://fonts.google.com/specimen/DotGothic16)
  - [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)
- LocalStorage data for:
  - Player Name
  - Game Difficulty
  - Themes (Classic White, Dark Mode, Neon, and Garfield theme)
  - Leaderboard Scores

## One-liner Quote/Tagline
> “Now with more snake.”

## User Story
**User Story**

I want to create a classic Snake game with a retro style that will run in a browser.
I want to save player names and settings.
I want to track player high scores on a leaderboard and remember them between games.

## GitHub Links
- **Repo:** [https://github.com/AJuna345/snake-game](https://github.com/AJuna345/snake-game)
- **Deployed App:** [https://ajuna345.github.io/snake-game/](https://ajuna345.github.io/snake-game/)

## Model / Inspiration
- **Classic Snake arcade gameplay**
  - This project was inspired by simple retro browser and arcade Snake games
  - I used a clean one-page layout with a separate How to Play page, a settings form, and a modal leaderboard to make the game more polished and user-friendly

## Project Features
- Playable Snake game with Bootstrap navbar
- Player Name and Settings
  - Player name validation
  - Theme selector
  - Difficulty selector
- How to Play page
- LocalStorage for player settings and leaderboard data
- Modal leaderboard with clear button
- Keyboard controls (up, down, left, right)
- Accessible status announcements with `aria-live`
- Garfield Easter egg theme

## Code block + explanation (“game.js” settings form submit handler)
This code listens for the **Settings Form** to be submitted and then connects the form directly to the **DOM** by reading values from the page with `getElementById()`. It checks the player name field for errors, shows inline messages in the page if something is wrong, and stops the form from doing a normal page reload with `event.preventDefault()`. If the form is valid, it saves the player name, theme, and speed settings in local storage and updates the page immediately by changing the theme class on the `<body>` element. This is a good example of JavaScript reading from the DOM, validating user input, updating text in the DOM, and applying changes live to the interface.

```javascript
if (settingsForm) {
    settingsForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Clear old inline errors
        if (playerNameError) playerNameError.textContent = '';
        if (themeError) themeError.textContent = '';
        if (speedError) speedError.textContent = '';

        if (nameInput) nameInput.setCustomValidity('');
        if (themeSelect) themeSelect.setCustomValidity('');
        if (speedSelect) speedSelect.setCustomValidity('');

        // Player name validation
        if (nameInput) {
            if (nameInput.validity.valueMissing) {
                nameInput.setCustomValidity('Please enter a player name.');
                if (playerNameError) playerNameError.textContent = 'Please enter a player name.';
            } else if (nameInput.validity.tooShort) {
                nameInput.setCustomValidity('Name must be at least 2 characters.');
                if (playerNameError) playerNameError.textContent = 'Name must be at least 2 characters.';
            } else if (nameInput.validity.tooLong) {
                nameInput.setCustomValidity('Name must be 12 characters or fewer.');
                if (playerNameError) playerNameError.textContent = 'Name must be 12 characters or fewer.';
            } else if (nameInput.validity.patternMismatch) {
                nameInput.setCustomValidity('Use only letters, numbers, and spaces.');
                if (playerNameError) playerNameError.textContent = 'Use only letters, numbers, and spaces.';
            }
        }

        if (!settingsForm.checkValidity()) {
            settingsForm.reportValidity();
            return;
        }

        const playerName = nameInput.value.trim();
        const selectedTheme = themeSelect.value;
        const selectedSpeed = parseInt(speedSelect.value);

        savePlayerName(playerName);
        saveTheme(selectedTheme);
        saveSpeed(selectedSpeed);

        speed = selectedSpeed;
        document.body.className = `theme-${selectedTheme}`;

        if (greeting) {
            greeting.textContent = `Settings saved for ${playerName}!`;
        }
    });
}
