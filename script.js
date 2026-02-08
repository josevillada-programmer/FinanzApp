let myChart;
const fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('aceptarTerminos').onclick = () => {
        document.getElementById('modalTerminos').style.display = "none";
        ejecutar(false);
    };
    document.getElementById('btnCalcular').onclick = () => ejecutar(true);
    document.getElementById('cerrarAlerta').onclick = () => document.getElementById('modalAlerta').style.display = "none";
    document.getElementById('btnPDF').onclick = generarPDF;
    
    document.getElementById('tasa').onchange = (e) => {
        const warning = document.getElementById('risk-warning');
        warning.style.display = (parseFloat(e.target.value) >= 25) ? "block" : "none";
    };

    document.getElementById('cerrarReporte').onclick = () => {
        document.getElementById('modalResultado').style.display = "none";
        document.getElementById('detalle-final').innerHTML = "";
    };

    document.getElementById('theme-toggle').onclick = () => {
        document.body.classList.toggle('light-mode');
        ejecutar(false);
    };
});

function generarPDF() {
    const elemento = document.getElementById('reporte-pdf');
    const opt = {
        margin: 10,
        filename: 'Reporte_FinanzApp.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, logging: false, backgroundColor: '#1e293b' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(elemento).save();
}

function ejecutar(mostrarModal) {
    const inicio = parseInt(document.getElementById('edad-inicio').value);
    const fin = parseInt(document.getElementById('edad-fin').value);
    const aporte = parseFloat(document.getElementById('aporte').value);
    const select = document.getElementById('tasa');
    const tasa = parseFloat(select.value);
    const nombreEstrategia = select.options[select.selectedIndex].text;
    const anios = fin - inicio;

    if (anios > 90) {
        document.getElementById('modalAlerta').style.display = "flex";
        return;
    }
    if (anios <= 0 || isNaN(aporte)) return;

    const meses = anios * 12;
    const r = (tasa / 100) / 12;
    let total = 0, capTotal = 0, dataGrafica = [], etiquetas = [];

    for (let i = 1; i <= meses; i++) {
        total = (total + aporte) * (1 + r);
        capTotal += aporte;
        if (i % 12 === 0) {
            dataGrafica.push(total.toFixed(0));
            etiquetas.push(`Año ${i / 12}`);
        }
    }

    document.getElementById('res-total').innerText = fmt.format(total);
    document.getElementById('res-capital').innerText = fmt.format(capTotal);
    document.getElementById('res-interes').innerText = fmt.format(total - capTotal);

    actualizarGrafica(etiquetas, dataGrafica);

    if (mostrarModal) {
        document.getElementById('detalle-final').innerHTML = `
            <p style="color:#94a3b8;">Reporte para retiro a los ${fin} años:</p>
            <h1 style="color:var(--profit); margin:15px 0;">${fmt.format(total)}</h1>
            <p><strong>Estrategia:</strong> ${nombreEstrategia}</p>
            <p><strong>Capital invertido:</strong> ${fmt.format(capTotal)}</p>
            <p><strong>Rendimiento generado:</strong> ${fmt.format(total - capTotal)}</p>
            <small style="display:block; margin-top:15px; color:#ef4444;">* Documento generado por Villada | Ingeniería & Finanzas.</small>
        `;
        document.getElementById('modalResultado').style.display = "flex";
    }
}

function actualizarGrafica(labels, data) {
    const isLight = document.body.classList.contains('light-mode');
    const color = isLight ? '#64748b' : '#94a3b8';
    const ctx = document.getElementById('mainChart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                borderColor: '#38bdf8',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                fill: true, tension: 0.4, pointRadius: 0
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: { ticks: { color: color, callback: (v) => '$' + (v/1e6).toFixed(1) + 'M' } },
                x: { ticks: { color: color } }
            },
            plugins: { legend: { display: false } }
        }
    });
}