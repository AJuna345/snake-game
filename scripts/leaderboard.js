document.addEventListener('DOMContentLoaded', () => {
    const leaderboardBody = document.getElementById('leaderboard-body');
    const leaderboardModal = document.getElementById('leaderboardModal');

    // Function to fetch and draw the scores
    function loadLeaderboard() {
        if (!leaderboardBody) return;

        // 1. Get scores from LocalStorage (change 'snakeScores' if you used a different key)
        let scores = JSON.parse(localStorage.getItem('snakeScores')) || [];

        // 2. Sort scores from highest to lowest
        scores.sort((a, b) => b.score - a.score);

        // 3. Clear the existing table rows
        leaderboardBody.innerHTML = '';

        // 4. If no scores exist, show a friendly message
        if (scores.length === 0) {
            leaderboardBody.innerHTML = `
                <tr>
                    <td colspan="3" class="text-muted py-3">No scores yet. Play a game to get on the board!</td>
                </tr>`;
            return;
        }

        // 5. Inject the top scores into the table
        // .slice(0, 10) ensures we only show the Top 10!
        scores.slice(0, 10).forEach((entry, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="fw-bold">${index + 1}</td>
                <td>${entry.name}</td>
                <td>${entry.score}</td>
            `;
            leaderboardBody.appendChild(row);
        });
    }

    // Load the scores when the page first loads just in case
    loadLeaderboard();

    // MAGIC FIX: Re-load the scores EVERY TIME the modal pops open!
    if (leaderboardModal) {
        leaderboardModal.addEventListener('show.bs.modal', loadLeaderboard);
    }
});
