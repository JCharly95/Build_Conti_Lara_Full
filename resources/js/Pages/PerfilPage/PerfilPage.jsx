import React, { useEffect, useState } from "react";
import PagesLayout from "../../Layouts/PagesLayout/PagesLayout";

function PerfilPage({ children }){


    return(<section>
        <h1>Esto es una prueba del perfil</h1>
    </section>);
}

// Establecer el layout que contendra a esta pagina
PerfilPage.layout = (page) => <PagesLayout children={page} />
export default PerfilPage;