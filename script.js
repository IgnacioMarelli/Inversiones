document.addEventListener('DOMContentLoaded', async () => {
    const inversiones = [
        { nombre: 'QQQ', id: 'QQQ', precioDeCompra: 553.619, cantidadComprada: 0.16256594, tipo: 'stock' },
        { nombre: 'SPY 500', id: 'SPY', precioDeCompra: 621.616, cantidadComprada: 0.14478885, tipo: 'stock' },
        { nombre: 'DGRO', id: 'DGRO', precioDeCompra: 66.273, cantidadComprada: 0.754474, tipo: 'stock' },
        { nombre: 'ADBE', id: 'ADBE', precioDeCompra: 364.07, cantidadComprada: 0.1374, tipo: 'stock' },
        { nombre: 'YPF', id: 'YPF', precioDeCompra: 23.6434, cantidadComprada: 0.8459, tipo: 'stock' },
        { nombre: 'BIDU', id: 'BIDU', precioDeCompra: 140.173, cantidadComprada: 0.05429, tipo: 'stock' },
        { nombre: 'MCHI', id: 'MCHI', precioDeCompra: 67.0875, cantidadComprada: 0.113434, tipo: 'stock' },
        { nombre: 'JD', id: 'JD', precioDeCompra: 36.1764, cantidadComprada: 0.210358, tipo: 'stock' }
    ];

    const tablaBody = document.querySelector('tbody');
    const totalInvertidoElemento = document.getElementById('total-invertido');
    const valorActualTotalElemento = document.getElementById('valor-actual-total');
    const gananciaPerdidaTotalElemento = document.getElementById('ganancia-perdida-total');
    const graficoBarrasElemento = document.getElementById('grafico-barras');

    let totalInvertido = 0;
    let valorActualTotal = 0;
    let gananciaPerdidaTotal = 0;
    let maxValor = 0;

    // Obtener precio de criptomonedas (CoinGecko)
    async function obtenerValorCrypto(cryptoId) {
        try {
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`;
            const response = await fetch(url);
            const data = await response.json();
            return data[cryptoId]?.usd || 0;
        } catch (error) {
            console.error(`Error al obtener el valor de ${cryptoId}:`, error);
            return 0;
        }
    }

    // Obtener precio de acciones/ETFs (Finnhub)
    async function obtenerValorStock(symbol) {
        const finnhubApiKey = 'd2af6thr01qoad6pjavgd2af6thr01qoad6pjb00'; 
        try {
            const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            return data && data.c ? data.c : 0;
        } catch (error) {
            console.error(`Error al obtener el valor de ${symbol}:`, error);
            return 0;
        }
    }

    // Renderizar dashboard
    async function renderizarDashboard() {
        tablaBody.innerHTML = '';
        graficoBarrasElemento.innerHTML = '';
        totalInvertido = 0;
        valorActualTotal = 0;
        gananciaPerdidaTotal = 0;
        maxValor = 0;

        for (const inv of inversiones) {
            let valorActualUnitario = 0;

            if (inv.tipo === 'crypto') {
                valorActualUnitario = await obtenerValorCrypto(inv.id);
            } else {
                valorActualUnitario = await obtenerValorStock(inv.id);
            }

            const costoTotal = inv.cantidadComprada * inv.precioDeCompra;
            const valorActual = inv.cantidadComprada * valorActualUnitario;
            const gananciaPerdida = valorActual - costoTotal;
            const estadoClase = gananciaPerdida > 0 ? 'ganancia' : (gananciaPerdida < 0 ? 'perdida' : 'neutro');
            const iconoTipo = inv.tipo === 'crypto' ? 'crypto-icon' : 'stock-icon';

            // Link condicional
            const link = inv.tipo === 'crypto'
                ? `https://www.coingecko.com/en/coins/${inv.id}`
                : `https://www.google.com/finance/quote/${inv.id}:NYSE`;

            // Totales
            totalInvertido += costoTotal;
            valorActualTotal += valorActual;

            // Fila tabla
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td><i class="${inv.icon ? inv.icon : 'fas fa-chart-line'} ${iconoTipo}"></i> 
                    <a href="${link}" target="_blank">${inv.nombre}</a></td>
                <td>${inv.cantidadComprada.toFixed(8)}</td>
                <td>$${inv.precioDeCompra.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>$${costoTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>$${valorActualUnitario.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>$${valorActual.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="${estadoClase}">$${gananciaPerdida.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            `;
            tablaBody.appendChild(fila);

            // Gráfico
            const valorGrafico = Math.max(valorActual, 1);
            if (valorGrafico > maxValor) maxValor = valorGrafico;
            inv.valorActual = valorActual;
        }
        
        // Totales globales
        gananciaPerdidaTotal = valorActualTotal - totalInvertido;
        gananciaPerdidaTotal=gananciaPerdidaTotal+196;
        const totalGananciaClase = gananciaPerdidaTotal > 0 ? 'ganancia' : (gananciaPerdidaTotal < 0 ? 'perdida' : 'neutro');

        totalInvertidoElemento.textContent = `$${totalInvertido.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        valorActualTotalElemento.textContent = `$${valorActualTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        gananciaPerdidaTotalElemento.textContent = `$${gananciaPerdidaTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        gananciaPerdidaTotalElemento.className = totalGananciaClase;

        // Gráfico de barras
        for (const inv of inversiones) {
            const altura = (inv.valorActual / maxValor) * 100;
            const barra = document.createElement('div');
            barra.className = 'barra';
            barra.style.setProperty('--final-height', `${altura}%`);
            barra.innerHTML = `<span>${inv.nombre}<br>$${inv.valorActual.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>`;
            graficoBarrasElemento.appendChild(barra);
        }
    }

    renderizarDashboard();
});
