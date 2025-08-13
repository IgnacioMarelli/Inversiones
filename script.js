document.addEventListener('DOMContentLoaded', async () => {
    // Array de inversiones actualizado con la información que proporcionaste
    // Los precios de compra unitarios para las acciones/ETFs se han recalculado
    // a partir de los costos totales que mencionaste.
    const inversiones = [
        // Criptomonedas
        { nombre: 'Bitcoin', id: 'bitcoin', precioDeCompra: 117375.57, cantidadComprada: 0.00371702, tipo: 'crypto', icon: 'fab fa-btc' },
        { nombre: 'BNB', id: 'binancecoin', precioDeCompra: 760.834, cantidadComprada: 0.04229507, tipo: 'crypto', icon: 'fab fa-btc' }, // Usamos el mismo icono para simular

        // Acciones y ETFs
        { nombre: 'QQQ', id: 'QQQ', precioDeCompra: 553.619, cantidadComprada: 0.16256594, tipo: 'stock' }, // 90 / 0.16256594
        { nombre: 'SPY 500', id: 'SPY', precioDeCompra: 621.616, cantidadComprada: 0.14478885, tipo: 'stock' }, // 90 / 0.14478885
        { nombre: 'MELI', id: 'MELI', precioDeCompra: 2458.452, cantidadComprada: 0.036608, tipo: 'stock' }, // 90 / 0.036608
        { nombre: 'DGRO', id: 'DGRO', precioDeCompra: 66.273, cantidadComprada: 0.754474, tipo: 'stock' }, // 50 / 0.754474
        { nombre: 'PYPL', id: 'PYPL', precioDeCompra: 72.508, cantidadComprada: 0.689681, tipo: 'stock' }, // 50 / 0.689681
        { nombre: 'XLV', id: 'XLV', precioDeCompra: 141.749, cantidadComprada: 0.352769, tipo: 'stock' }, // 50 / 0.352769
        { nombre: 'BABA', id: 'BABA', precioDeCompra: 118.828, cantidadComprada: 0.210392, tipo: 'stock' }, // 25 / 0.210392
        { nombre: 'SLB', id: 'SLB', precioDeCompra: 35.704, cantidadComprada: 0.700193, tipo: 'stock' }, // 25 / 0.700193
        { nombre: 'SPOT', id: 'SPOT', precioDeCompra: 705.28, cantidadComprada: 0.0844, tipo: 'stock' } // 25 / 0.700193

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

    // Función para obtener precios de criptomonedas de CoinGecko
    async function obtenerValorCrypto(cryptoId) {
        try {
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`;
            const response = await fetch(url);
            const data = await response.json();
            return data[cryptoId]?.usd || 0; // Manejo de errores si la API no devuelve el precio
        } catch (error) {
            console.error(`Error al obtener el valor de la criptomoneda ${cryptoId}:`, error);
            return 0;
        }
    }

    // Función para obtener precios de acciones y ETFs de Finnhub
    async function obtenerValorStock(symbol) {
        const finnhubApiKey = 'd2af6thr01qoad6pjavgd2af6thr01qoad6pjb00'; 
        
        try {
            const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            
            // La 'c' en la respuesta JSON de Finnhub representa el precio actual de cierre.
            if (data && data.c) {
                return data.c; 
            } else {
                console.error(`Error al obtener el valor de la acción ${symbol}:`, data);
                return 0;
            }
        } catch (error) {
            console.error(`Error en la llamada a la API de Finnhub para ${symbol}:`, error);
            return 0;
        }
    }

    // Función para renderizar la tabla y el gráfico
    async function renderizarDashboard() {
        // Limpiar el contenido anterior
        tablaBody.innerHTML = '';
        graficoBarrasElemento.innerHTML = '';
        
        // Resetear totales
        totalInvertido = 0;
        valorActualTotal = 0;
        gananciaPerdidaTotal = 0;
        maxValor = 0;

        // Bucle principal para procesar cada inversión
        for (const inv of inversiones) {
            let valorActualUnitario = 0;
            if (inv.tipo === 'crypto') {
                valorActualUnitario = await obtenerValorCrypto(inv.id);
            } else if (inv.tipo === 'stock') {
                valorActualUnitario = await obtenerValorStock(inv.id);
            }

            const costoTotal = inv.cantidadComprada * inv.precioDeCompra;
            const valorActual = inv.cantidadComprada * valorActualUnitario;
            const gananciaPerdida = valorActual - costoTotal;
            const estadoClase = gananciaPerdida > 0 ? 'ganancia' : (gananciaPerdida < 0 ? 'perdida' : 'neutro');
            const iconoTipo = inv.tipo === 'crypto' ? 'crypto-icon' : 'stock-icon';

            // Actualizar los totales globales
            totalInvertido += costoTotal;
            valorActualTotal += valorActual;

            // Generar la fila de la tabla
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td><i class="${inv.icon ? inv.icon : 'fas fa-chart-line'} ${iconoTipo}"></i> <a href="https://www.google.com/finance/quote/${inv.nombre}:NYSE">${inv.nombre}</a></td>
                <td>${inv.cantidadComprada.toFixed(8)}</td>
                <td>$${inv.precioDeCompra.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>$${costoTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>$${valorActualUnitario.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>$${valorActual.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="${estadoClase}">$${gananciaPerdida.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            `;
            tablaBody.appendChild(fila);

            // Preparar datos para el gráfico
            const valorGrafico = Math.max(valorActual, 1); // Evitar altura de 0 para la barra
            if (valorGrafico > maxValor) {
                maxValor = valorGrafico;
            }
            inv.valorActual = valorActual;
        }

        // Actualizar los totales globales en el dashboard
        gananciaPerdidaTotal = valorActualTotal - totalInvertido;
        const totalGananciaClase = gananciaPerdidaTotal > 0 ? 'ganancia' : (gananciaPerdidaTotal < 0 ? 'perdida' : 'neutro');

        totalInvertidoElemento.textContent = `$${totalInvertido.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        valorActualTotalElemento.textContent = `$${valorActualTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        gananciaPerdidaTotalElemento.textContent = `$${gananciaPerdidaTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        gananciaPerdidaTotalElemento.className = totalGananciaClase;

        // Generar el gráfico de barras una vez que se tiene el valor máximo
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