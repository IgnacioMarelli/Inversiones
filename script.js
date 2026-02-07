document.addEventListener('DOMContentLoaded', async () => {
    // FECHA DE REFERENCIA PARA EL CÁLCULO DE USDT (Formato YYYY-MM-DD)
    const fechaInicioUSDT = '2026-02-05'; 

    /* NOTA: Las 'cantidades' de las acciones han sido estimadas para que coincidan 
       con tus montos de inversión y pérdidas actuales usando precios de mercado recientes.
       Debido a la fluctuación del mercado en tiempo real, los valores pueden variar ligeramente.
    */
    const inversiones = [
        // --- CRYPTO ---
        { nombre: 'BTC', id: 'bitcoin', precioDeCompra: 119000, cantidadComprada: 0.01275214, tipo: 'crypto', icon: 'fa-brands fa-bitcoin' },
        
        // --- RENTA FIJA / TASA (USDT) ---
        // Capital: 1200, Tasa Anual: 10%. Se calcula ganancia diaria acumulada.
        { nombre: 'USDT Earn (10%)', id: 'tether', capital: 1200, tasaAnual: 0.10, fechaInicio: fechaInicioUSDT, tipo: 'tasa', icon: 'fas fa-sack-dollar' },

        // --- STOCKS / ETFS ---
        // GLD: Inv $99.25 | Perdida $0.6 | Valor ~$98.65
        { nombre: 'Oro (GLD)', id: 'GLD', precioDeCompra: 459.9816, cantidadComprada: 0.2174, tipo: 'stock' },
        
        // EWZ: Inv $37.39 | Perdida $0.44 | Valor ~$36.95
        { nombre: 'Brazil (EWZ)', id: 'EWZ', precioDeCompra: 38.12964, cantidadComprada: 0.9966, tipo: 'stock' },
        
        // META: Inv $35.64 | Perdida $0.90 | Valor ~$34.74
        { nombre: 'Meta', id: 'META', precioDeCompra: 713.407, cantidadComprada: 0.0537, tipo: 'stock' },
        
        // SPY: Inv $35.23 | Ganancia $0.15 | Valor ~$35.38
        { nombre: 'S&P 500', id: 'SPY', precioDeCompra: 694.444, cantidadComprada: 0.0216, tipo: 'stock' },
        
        // GGAL: Inv $19.32 | Perdida $0.58 | Valor ~$18.74
        { nombre: 'Galicia (GGAL)', id: 'GGAL', precioDeCompra: 51.1076, cantidadComprada: 0.3837, tipo: 'stock' },
        
        // GOOGL: Inv $15.96 | Perdida $0.74 | Valor ~$15.22
        { nombre: 'Google', id: 'GOOGL', precioDeCompra: 339.35, cantidadComprada: 0.049345, tipo: 'stock' },
        
        // QQQ: Inv $15.21 | Perdida $0.32 | Valor ~$14.89
        { nombre: 'Nasdaq (QQQ)', id: 'QQQ', precioDeCompra: 627.615, cantidadComprada: 0.0239, tipo: 'stock' },
        
        // SLV: Inv $14.37 | Perdida $6.34 | Valor ~$8.03
        { nombre: 'Silver (SLV)', id: 'SLV', precioDeCompra: 120.25, cantidadComprada: 0.2044, tipo: 'stock' },
        
        // PLTR: Inv $12.54 | Perdida $2.52 | Valor ~$10.02
        { nombre: 'Palantir', id: 'PLTR', precioDeCompra: 166, cantidadComprada: 0.0916, tipo: 'stock' }
    ];

    const tablaBody = document.querySelector('tbody');
    const totalInvertidoElemento = document.getElementById('total-invertido');
    const valorActualTotalElemento = document.getElementById('valor-actual-total');
    const gananciaPerdidaTotalElemento = document.getElementById('ganancia-perdida-total');
    const graficoBarrasElemento = document.getElementById('grafico-barras');

    // API Keys (Nota: Finnhub tiene límites estrictos en la versión gratuita, a veces puede fallar si recargas rápido)
    const finnhubApiKey = 'd2af6thr01qoad6pjavgd2af6thr01qoad6pjb00'; 

    async function obtenerValorCrypto(cryptoId) {
        try {
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=usd`;
            const response = await fetch(url);
            const data = await response.json();
            return data[cryptoId]?.usd || 0;
        } catch (error) {
            console.error(`Error crypto ${cryptoId}:`, error);
            return 0;
        }
    }

    async function obtenerValorStock(symbol) {
        try {
            const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubApiKey}`;
            const response = await fetch(url);
            const data = await response.json();
            return data.c ? data.c : 0;
        } catch (error) {
            console.error(`Error stock ${symbol}:`, error);
            return 0;
        }
    }

    // Calcular ganancia acumulada diaria (Interés Compuesto Diario)
    function calcularTasaDiaria(capital, tasaAnual, fechaInicio) {
        const ahora = new Date();
        const inicio = new Date(fechaInicio);
        // Diferencia en milisegundos a días
        const diasTranscurridos = Math.max(0, (ahora - inicio) / (1000 * 60 * 60 * 24));
        
        // Fórmula de interés compuesto diario: Capital * (1 + tasa_diaria) ^ dias
        // Tasa diaria aproximada = Tasa Anual / 365
        const tasaDiaria = tasaAnual / 365;
        const valorFinal = capital * Math.pow((1 + tasaDiaria), diasTranscurridos);
        
        return {
            valorActual: valorFinal,
            ganancia: valorFinal - capital,
            dias: Math.floor(diasTranscurridos)
        };
    }

    async function renderizarDashboard() {
        tablaBody.innerHTML = '';
        graficoBarrasElemento.innerHTML = '';
        
        let totalInvertido = 0;
        let valorActualTotal = 0;
        let maxValor = 0;

        for (const inv of inversiones) {
            let valorActual = 0;
            let costoTotal = 0;
            let precioUnitarioActual = 0;
            let gananciaPerdida = 0;
            let detalleCantidad = '';
            let detallePrecio = '';

            // Lógica según tipo de inversión
            if (inv.tipo === 'tasa') {
                // Cálculo para USDT Earn
                const resultado = calcularTasaDiaria(inv.capital, inv.tasaAnual, inv.fechaInicio);
                valorActual = resultado.valorActual;
                costoTotal = inv.capital;
                gananciaPerdida = resultado.ganancia;
                precioUnitarioActual = 1.00; // USDT fijo a 1 teorico para display
                
                detalleCantidad = `$${inv.capital.toLocaleString('es-ES')} (Cap)`;
                detallePrecio = `+${(inv.tasaAnual * 100).toFixed(0)}% Anual`;

            } else {
                // Cálculo para Stocks y Crypto
                if (inv.tipo === 'crypto') {
                    precioUnitarioActual = await obtenerValorCrypto(inv.id);
                } else {
                    precioUnitarioActual = await obtenerValorStock(inv.id);
                }

                // Si la API falla (devuelve 0), usamos el precio de compra para no romper el cálculo visualmente
                if (precioUnitarioActual === 0) precioUnitarioActual = inv.precioDeCompra;

                costoTotal = inv.cantidadComprada * inv.precioDeCompra;
                valorActual = inv.cantidadComprada * precioUnitarioActual;
                gananciaPerdida = valorActual - costoTotal;
                
                detalleCantidad = inv.cantidadComprada.toFixed(inv.tipo === 'crypto' ? 6 : 2);
                detallePrecio = `$${precioUnitarioActual.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }

            // Sumar a globales
            totalInvertido += costoTotal;
            valorActualTotal += valorActual;

            // Clases visuales
            const estadoClase = gananciaPerdida >= 0 ? 'ganancia' : 'perdida';
            const iconoClass = inv.icon ? inv.icon : (inv.tipo === 'crypto' ? 'fas fa-coins crypto-icon' : 'fas fa-chart-line stock-icon');
            
            // Link
            let link = '#';
            if (inv.tipo === 'crypto') link = `https://www.coingecko.com/en/coins/${inv.id}`;
            else if (inv.tipo === 'stock') link = `https://www.google.com/finance/quote/${inv.id}:NYSE`;

            // Construir Fila
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>
                    <i class="${iconoClass}"></i> 
                    <a href="${link}" target="_blank" style="margin-left:8px; font-weight:bold;">${inv.nombre}</a>
                </td>
                <td>${detalleCantidad}</td>
                <td>$${costoTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>${detallePrecio}</td>
                <td style="font-weight:bold;">$${valorActual.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td class="${estadoClase}">
                    ${gananciaPerdida > 0 ? '+' : ''}$${gananciaPerdida.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
            `;
            tablaBody.appendChild(fila);

            // Preparar gráfico
            inv.valorParaGrafico = valorActual;
            if (valorActual > maxValor) maxValor = valorActual;
        }

        // Totales Finales
        const gananciaTotalGlobal = valorActualTotal - totalInvertido;
        const claseTotal = gananciaTotalGlobal >= 0 ? 'ganancia' : 'perdida';

        totalInvertidoElemento.textContent = `$${totalInvertido.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        valorActualTotalElemento.textContent = `$${valorActualTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        gananciaPerdidaTotalElemento.textContent = `${gananciaTotalGlobal >= 0 ? '+' : ''}$${gananciaTotalGlobal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        // Limpiar clases anteriores y poner la nueva
        gananciaPerdidaTotalElemento.classList.remove('ganancia', 'perdida', 'neutro');
        gananciaPerdidaTotalElemento.classList.add(claseTotal);

        // Renderizar Gráfico
        inversiones.forEach(inv => {
            const altura = (inv.valorParaGrafico / maxValor) * 100;
            const barra = document.createElement('div');
            barra.className = 'barra';
            barra.style.setProperty('--final-height', `${altura}%`);
            
            // Tooltip simple al pasar el mouse o texto debajo
            barra.innerHTML = `
                <span>
                    ${inv.nombre}<br>
                    $${Math.round(inv.valorParaGrafico)}
                </span>
            `;
            graficoBarrasElemento.appendChild(barra);
        });
    }

    renderizarDashboard();
});