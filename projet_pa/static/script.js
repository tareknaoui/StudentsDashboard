let chart1, chart2, chart3, chart4;

document.addEventListener('DOMContentLoaded', function() {
    const ctx1 = document.getElementById('chart1').getContext('2d');
    const ctx2 = document.getElementById('chart2').getContext('2d');
    const ctx3 = document.getElementById('chart3').getContext('2d');
    const ctx4 = document.getElementById('chart4').getContext('2d');
    
    // Initialize refresh button
    const refreshButton = document.querySelector('header button');
    refreshButton.addEventListener('click', refreshData);

    // Fetch and update all data
    function refreshData() {
        refreshButton.disabled = true;
        refreshButton.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Actualisation...';
        
        fetchData()
            .then(updateDashboard)
            .catch(handleError)
            .finally(() => {
                refreshButton.disabled = false;
                refreshButton.innerHTML = '<i class="fas fa-sync-alt"></i> Actualiser';
            });
    }

    // Fetch data from API
    function fetchData() {
        return fetch('/api/etudiants').then(response => response.json());
    }

    // Update dashboard with new data
    function updateDashboard(data) {
        updateCards(data);
        updateCharts(data);
    }

    // Update statistical cards
    function updateCards(data) {
        const totalStudents = data.length;
        const successCount = data.filter(student => student.moyenne >= 10).length;
        const successRate = ((successCount / totalStudents) * 100).toFixed(1);
        const bestAverage = Math.max(...data.map(student => student.moyenne));
        const generalAverage = (data.reduce((sum, student) => sum + student.moyenne, 0) / totalStudents).toFixed(1);
        const totalboys = data.filter(student => student.sexe === 'H').length;
        const totalgirls = totalStudents - totalboys;

        document.getElementById('totalStudents').textContent = totalStudents;
        document.getElementById('successRate').textContent = successRate + '%';
        document.getElementById('bestAverage').textContent = bestAverage.toFixed(1);
        document.getElementById('generalAverage').textContent = generalAverage;
        document.getElementById('totalboys').textContent = totalboys;
        document.getElementById('totalgirls').textContent = totalgirls;
    }

    // Update all charts
    function updateCharts(data) {
        updateStudentsPerYearChart(data, ctx1);
        updateStudentsPerSpecialityChart(data, ctx2);
        updateSpecialityPieChart(data, ctx3);
        updateTopGradesChart(data, ctx4);
    }

    // Chart 1: Students per year
    function updateStudentsPerYearChart(data, ctx) {
        const studentsByYear = {};
        data.forEach(student => {
            studentsByYear[student.annee] = (studentsByYear[student.annee] || 0) + 1;
        });

        const years = Object.keys(studentsByYear).sort();
        const counts = years.map(year => studentsByYear[year]);

        if (chart1) chart1.destroy();
        chart1 = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: years,
                datasets: [{
                    label: 'Nombre d\'étudiants',
                    data: counts,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: { y: { beginAtZero: true } }
            }
        });
    }

    // Chart 2: Students per speciality evolution
    function updateStudentsPerSpecialityChart(data, ctx) {
        // Get unique years
        const years = [...new Set(data.map(s => s.annee))].sort();
    
        // Calculate best average per year
        const bestAverages = years.map(year => {
            const yearData = data.filter(s => s.annee === year);
            return Math.max(...yearData.map(s => s.moyenne));
        });
    
        if (chart2) chart2.destroy();
        chart2 = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Meilleure moyenne par année',
                    data: bestAverages,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderWidth: 3,
                    tension: 0.3,
                    pointRadius: 6,
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolution de la meilleure moyenne par année',
                        font: {
                            size: 16
                        }
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        min: 10,
                        max: 20,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }
    // Chart 3: Speciality distribution pie chart
    function updateSpecialityPieChart(data, ctx) {
        const yearSelector = document.getElementById('yearSelector');
        yearSelector.innerHTML = '';
        
        const years = [...new Set(data.map(s => s.annee))].sort();
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelector.appendChild(option);
        });

        function createPieChart(selectedYear) {
            const specCount = {};
            data.filter(s => s.annee == selectedYear)
                .forEach(student => {
                    specCount[student.specialite] = (specCount[student.specialite] || 0) + 1;
                });

            if (chart3) chart3.destroy();
            chart3 = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: Object.keys(specCount),
                    datasets: [{
                        data: Object.values(specCount),
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(153, 102, 255, 0.8)',
                            'rgba(255, 159, 64, 0.8)',
                            'rgba(199, 199, 199, 0.8)'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: `Répartition des étudiants par spécialité (${selectedYear})`
                        },
                        legend: { position: 'bottom' }
                    }
                }
            });
        }

        createPieChart(years[0]);
        yearSelector.addEventListener('change', (e) => createPieChart(e.target.value));
    }

    // Chart 4: Top grades by speciality
    function updateTopGradesChart(data, ctx) {
        const bestGrades = {};
        data.forEach(student => {
            if (!bestGrades[student.specialite] || student.moyenne > bestGrades[student.specialite]) {
                bestGrades[student.specialite] = student.moyenne;
            }
        });

        const top3 = Object.entries(bestGrades)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);

        if (chart4) chart4.destroy();
        chart4 = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: top3.map(([spec]) => spec),
                datasets: [{
                    label: 'Meilleures notes par spécialité',
                    data: top3.map(([,grade]) => grade),
                    backgroundColor: [
                        'rgba(255, 215, 0, 0.8)',
                        'rgba(192, 192, 192, 0.8)',
                        'rgba(205, 127, 50, 0.8)'
                    ],
                    borderColor: [
                        'rgba(255, 215, 0, 1)',
                        'rgba(192, 192, 192, 1)',
                        'rgba(205, 127, 50, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Podium des meilleures notes par spécialité'
                    }
                },
                scales: {
                    y: {
                        min: 10,
                        max: 20
                    }
                }
            }
        });
    }

    function handleError(error) {
        console.error('Error:', error);
        // Add UI error notification here if needed
    }

    // Initial load
    refreshData();
});