import React, { useEffect, useState } from "react";
import PagesLayout from "../../Layouts/PagesLayout/PagesLayout";

/** Funcion para renderizar el componente que contiene la pagina del perfil
 * @returns {JSX.Element} Pagina del perfil renderizada */
function PerfilPage({ children }){
    return(<section>
        <h1>Esto es una prueba del perfil</h1>
    </section>);
}

// Establecer PagesLayout como el layout que contendrá a esta pagina
PerfilPage.layout = (page) => <PagesLayout children={page} />
export default PerfilPage;