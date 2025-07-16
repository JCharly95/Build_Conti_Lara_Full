import React, { useState, useEffect } from "react";

/** Hook customizado que regresa un objeto con las dimensiones de la pantalla
 * @returns Objeto que contiene la altura y anchura de la pantalla */
export default function useVentaDimen(){
    // Crear una variable de estado con un objeto que contendrá el tamaño de la ventana actual, anchura y altura
    const [dimension, setDimension] = useState({
        width: 0,
        height: 0
    });

    // Usar el hook useEffect para que cada que la ventana sea cambiada de tamaño obtenga el valor de la misma
    useEffect(() => {
        // Comprobar que estamos en el cliente, porque window existe solo del lado del navegador
        if (typeof window !== 'undefined') {
            // Función flecha que actualiza el valor del estado con las dimensiones de pantalla
            const cambiaTam = () => ( setDimension({ width: window.innerWidth, height: window.innerHeight }) );

            // Establecer las dimensiones iniciales al cargar el componente
            cambiaTam();
            // Agregar un listener para el evento de cambio de tamaño que llamará a la función de actualizacion de valores
            window.addEventListener("resize", cambiaTam);
            // Limpiar el listener cuando el componente se haya establecido y para evitar que se quede en bucle por el procesamiento del re-renderizado
            return () => {
                window.removeEventListener("resize", cambiaTam);
            };
        }
    }, []);

    // Regresar los valores con la dimension de pantalla correspondiente
    return dimension;
}