// --- CONFIGURATION INITIALE ET RÉFÉRENCES (Doc 4) ---
const I0 = 1.0e-12; // Intensité de référence
let currentL = 40;     // Niveau de départ
let currentI = 1e-8;    // Intensité de départ
let relativePower = 1;  // Puissance de base pour le cercle

// --- INITIALISATION DU GRAPHIQUE ---
const labels = [40];
const dataPointsI = [1e-8];

const ctx = document.getElementById('scientificChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'Intensité Physique (W/m²)',
            data: dataPointsI,
            borderColor: '#000',
            borderWidth: 2.5,
            pointRadius: 6,
            pointBackgroundColor: '#000',
            fill: false,
            tension: 0.2 // Effet de courbe lissée
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
            legend: { display: false },
            title: { display: true, text: 'GRAPHIQUE : ÉVOLUTION DE L\'INTENSITÉ I (échelle linéaire)', color: '#000', font: { weight: 'bold', size: 14 } }
        },
        scales: {
            y: { 
                type: 'linear',
                beginAtZero: true,
                title: { display: true, text: 'Intensité I (W/m²)', color: '#000', font: { weight: 'bold' } },
                grid: { color: '#f0f0f0' },
                ticks: { 
                    color: '#000',
                    callback: function(value) { return value.toExponential(1); } // Notation scientifique propre
                }
            },
            x: { 
                title: { display: true, text: 'Niveau sonore (dB)', color: '#000', font: { weight: 'bold' } },
                grid: { display: false },
                ticks: { color: '#000' }
            }
        },
        animation: { duration: 1000, easing: 'easeInOutQuart' }
    }
});

// --- LOGIQUE DE CHANGEMENT ---
function updateInterface() {
    // Calcul du rapport
    let ratio = currentI / I0;
    // Calcul de l'exposant (log10 du ratio)
    let exponent = Math.log10(ratio);

    // 1. Mise à jour des valeurs textes
    document.getElementById('dbValue').innerText = currentL.toFixed(1);
    document.getElementById('iValue').innerText = currentI.toExponential(1);
    document.getElementById('ratioValue').innerHTML = `10<sup>${exponent.toFixed(2)}</sup>`;

    // 2. Mise à jour de l'animation du cercle
    let baseCircleDiameter = 50; // Diamètre initial en pixels
    // On augmente le diamètre linéairement selon la puissance relative
    let newDiameter = baseCircleDiameter * relativePower;
    
    // Limite pour ne pas dépasser l'écran
    newDiameter = Math.min(newDiameter, 340);
    
    // Changement de style
    const circle = document.getElementById('energyCircle');
    circle.style.width = newDiameter + "px";
    circle.style.height = newDiameter + "px";
    // Changement de couleur pour les niveaux élevés
    if (currentL >= 85) circle.style.background = "#ff0000"; // Rouge si danger (85dB)
    else circle.style.background = "#000"; // Noir sinon

    // 3. Mise à jour du graphique
    labels.push(currentL.toFixed(1));
    dataPointsI.push(currentI);
    
    // On garde seulement les 10 derniers points pour la lisibilité
    if(labels.length > 8) {
        labels.shift();
        dataPointsI.shift();
    }
    chart.update();
}

// Fonction principale d'action
function changeIntensity(stepdB) {
    currentL += stepdB;
    
    // La règle d'or : +3dB = intensité x2
    if (stepdB > 0) {
        currentI *= 2;
        relativePower *= 2;
    } else {
        currentI /= 2;
        relativePower /= 2;
    }

    // Sécurité pour ne pas descendre trop bas
    if (relativePower < 0.1) {
        currentL -= stepdB; currentI *= 2; relativePower *= 2; return;
    }

    updateInterface();
}

// Fonction de réinitialisation
function resetSimulator() {
    currentL = 40;
    currentI = 1e-8;
    relativePower = 1;
    labels.splice(0, labels.length, 40);
    dataPointsI.splice(0, dataPointsI.length, 1e-8);
    updateInterface();
}

// Initialisation
updateInterface();
