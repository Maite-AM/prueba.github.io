document.addEventListener("DOMContentLoaded", async () => {
    const seleccionarMoneda = document.getElementById('seleccionarMoneda'); 
    const ingresarMonto = document.getElementById('ingresarMonto');
    const resultado = document.getElementById('resultado');
    const url = 'https://mindicador.cl/api';

    // Función para obtener monedas desde la API y llenar el select de opciones
    const obtenerMonedas = async () => {
        try {
            const respuesta = await fetch(url);
            if (!respuesta.ok) {
                throw new Error("Error al obtener las monedas");
            }
            const data = await respuesta.json();
            const monedasDisponibles = ['dolar', 'euro', 'uf'];

            monedasDisponibles.forEach(moneda => {
                const opcion = document.createElement('option');
                opcion.value = moneda;
                opcion.textContent = moneda.charAt(0).toUpperCase() + moneda.slice(1);
                seleccionarMoneda.appendChild(opcion);
            });
        } catch (error) {
            resultado.textContent = `Error: ${error.message}`;
        }
    };

    // Función para realizar la conversión del monto ingresado
    const convertirMoneda = async () => {
        const montoCLP = parseFloat(ingresarMonto.value);
        const monedaSeleccionada = seleccionarMoneda.value;

        if (!monedaSeleccionada || isNaN(montoCLP)) {
            resultado.textContent = 'Por favor, ingrese un monto válido y seleccione una moneda';
            return;
        }

        try {
            const respuesta = await fetch(`${url}/${monedaSeleccionada}`);
            if (!respuesta.ok) {
                throw new Error("Error al realizar la conversión");
            }
            const data = await respuesta.json();
            const valorMoneda = data.serie[0].valor;
            const conversion = montoCLP / valorMoneda;

            resultado.textContent = `Resultado: $${conversion.toFixed(2)}`;
            mostrarHistorial(data.serie);
        } catch (error) {
            resultado.textContent = `Error: ${error.message}`;
        }
    };

    // Función para mostrar el historial de la moneda/unidad de manera gràfica
    let graficoActual = null; 

    const mostrarHistorial = (serie) => {
        const ctx = document.getElementById('historial').getContext('2d');
        const etiquetas = serie.slice(0, 10).map(item => new Date(item.fecha).toLocaleDateString());
        const valores = serie.slice(0, 10).map(item => item.valor);

        if (graficoActual) {
            graficoActual.destroy();
        }

        graficoActual = new Chart(ctx, {
            type: 'line',
            data: {
                labels: etiquetas.reverse(),
                datasets: [{
                    label: 'Historial últimos 10 días',
                    data: valores.reverse(),
                    borderColor: '#FF6384',
                    borderWidth: 2,
                    fill: false,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white',
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Fecha',
                            color: 'white'
                        },
                        ticks: {
                            color: 'white'
                        }

                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: 'Valor',
                            color: 'white'
                        },
                        ticks: {
                            color: 'white'
                        }
                    }
                }
            }
        });
    };

    // Listener
    document.getElementById('btnConvertir').addEventListener('click', convertirMoneda);

    // Inicializar opciones
    await obtenerMonedas();
});


