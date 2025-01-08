document.addEventListener('DOMContentLoaded', function() {
    const ctx1 = document.getElementById('chart1').getContext('2d');
    const ctx2 = document.getElementById('chart2').getContext('2d');
    const ctx3 = document.getElementById('chart3').getContext('2d');
    const ctx4 = document.getElementById('chart4').getContext('2d');
    
    function loadData() {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/api/etudiants', true);
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText);
                    updateStats(data);
                    createCharts(data);
                } else {
                    console.error('Erreur avec le serveur');
                }
            }
        };
        xhr.send();
    }

    function updateStats(data) {
        const total = data.length;
        const passed = data.filter(s => s.moyenne >= 10).length;
        const passRate = ((passed / total) * 100).toFixed(1);
        const bestGrade = Math.max(...data.map(s => s.moyenne)).toFixed(2);
        const avgGrade = (data.reduce((sum, s) => sum + s.moyenne, 0) / total).toFixed(1);
        const boys = data.filter(s => s.sexe === 'H').length;
        const girls = total - boys;

        document.getElementById('totalStudents').textContent = total;
        document.getElementById('successRate').textContent = passRate + '%';
        document.getElementById('bestAverage').textContent = bestGrade;
        document.getElementById('generalAverage').textContent = avgGrade;
        document.getElementById('totalboys').textContent = boys;
        document.getElementById('totalgirls').textContent = girls;
    }

    function createCharts(data) {
        const yearCounts = {};
        data.forEach(s => yearCounts[s.annee] = (yearCounts[s.annee] || 0) + 1);
        
        new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: Object.keys(yearCounts),
                datasets: [{
                    label: 'Nombre d\'étudiants',
                    data: Object.values(yearCounts),
                    backgroundColor: 'rgba(75, 192, 192, 0.5)'
                }]
            },

        });

        const years = [...new Set(data.map(s => s.annee))].sort();
        const bestGrades = years.map(year => 
            Math.max(...data.filter(s => s.annee === year).map(s => s.moyenne))
        );

        new Chart(ctx2, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Meilleure moyenne',
                    data: bestGrades,
                    borderColor: 'rgb(255, 99, 132)',
                    fill: true
                }]
            },
            options: {
                scales: {
                    y: {
                        min: 10,
                        max: 20
                    }
                }
            }
        });

        const specCounts = {};
        data.forEach(s => specCounts[s.specialite] = (specCounts[s.specialite] || 0) + 1);

        new Chart(ctx3, {
            type: 'pie',
            data: {
                labels: Object.keys(specCounts),
                datasets: [{
                    data: Object.values(specCounts),
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56',
                        '#4BC0C0', '#9966FF', '#FF9F40'
                    ]
                }]
            }
        });

        const specialties = [...new Set(data.map(s => s.specialite))];
        
        const datasets = years.map((year, index) => ({
            label: 'Année ' + year,
            data: specialties.map(spec => 
                data.filter(s => s.annee === year && s.specialite === spec).length
            ),
            backgroundColor: `hsla(${index * 360/years.length}, 70%, 50%, 0.7)`
        }));

        new Chart(ctx4, {
            type: 'bar',
            data: {
                labels: specialties,
                datasets: datasets
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Nombre d\'étudiants par spécialité et année'
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Nombre d\'étudiants'
                        }
                    }
                }
            }
        });
    }

    document.querySelector('header button').onclick = loadData;
    loadData();
});