let entidades;

let ocupaciones;

let experiencias;

let formaciones;

let correo = localStorage.getItem("correo");

let userId = localStorage.getItem("usuario");
//------------- Conexion a Backend ----------------//

$(document).ready(function () {
    getDatos();
});

function getDatos() {
    axios.get(`https://tu-cv-api.herokuapp.com/misdatos`, {
            headers: {
                usuario: userId
            }
        })
        .then(function (res) {
            const {
                data,
                status
            } = res;
            if (status == 200) {
                cargarEncabezado(data);
                getEntidades();
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getEntidades() {
    axios.get("https://tu-cv-api.herokuapp.com/entidades", {
            headers: {
                usuario: userId
            }
        })
        .then(function (res) {
            const {
                data,
                status
            } = res;
            if (status == 200) {
                entidades = data;
                getOcupaciones();
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getOcupaciones() {
    axios.get('https://tu-cv-api.herokuapp.com/ocupaciones', {
            headers: {
                usuario: `${userId}`
            }
        })
        .then(function (res) {
            const {
                data,
                status
            } = res;
            if (status == 200) {
                ocupaciones = data;
                getExperiencias();
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getExperiencias() {
    axios.get('https://tu-cv-api.herokuapp.com/experiencias', {
            headers: {
                usuario: `${userId}`
            }
        })
        .then(function (res) {
            const {
                data,
                status
            } = res;
            if (status == 200) {
                experiencias = data;
                cargarExperiencias();
                getFormacion();
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getFormacion() {
    axios.get('https://tu-cv-api.herokuapp.com/formacion', {
            headers: {
                usuario: `${userId}`
            }
        })
        .then(function (res) {
            const {
                data,
                status
            } = res;
            if (status == 200) {
                formaciones = data.map(formacion => {
                    formacion.entidad = getEntidad(formacion.entidad);
                    formacion.fin = new Date(formacion.fin).getFullYear();
                    return formacion;
                }).sort((a, b) => b.fin - a.fin);
                cargarEducacion();
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getEntidad(id) {
    return entidades.find(entidad => entidad.id == id).nombre;
}


function cargarEncabezado(data) {
    if (data.nombre !== null) {
        $("#nombre").text(data.nombre);
        $("#apellido").text(data.apellido);
        $("#correo").text(correo).attr('href', `mailto:${correo}`);
        $("#telefono").text(data.telefono);
        $("#enlace").text(data.enlace).attr('href', `${data.enlace}`);
        $("#relevantes").text(data.relevantes);
    }
}

function cargarExperiencias() {
    const entidadesOcupacion = entidades.filter(entidad => {
        if (filtrarOcupaciones().find(ocupacion => ocupacion.entidad == entidad.id)) return entidad;
    });
    entidadesOcupacion.forEach(entidad => {
        const {
            id,
            nombre,
            descripcion
        } = entidad;
        const seccionEntidad = `
        <div id="seccion-entidad-${id}">
            <h3 class="mb-4"><b>${nombre.toUpperCase()}</b></h3>
            <p style="text-justify: auto;">${descripcion}</p>
        </div>
         `
        $(".seccion-experiencias").append(seccionEntidad);
        var ocupacionesEntidad = ocupaciones.filter(ocupacion => ocupacion.entidad == id);
        ocupacionesEntidad = ocupacionesEntidad.map(ocupacion => {
            ocupacion.inicio = new Date(ocupacion.inicio).getFullYear();
            ocupacion.fin = new Date(ocupacion.fin).getFullYear();
            return ocupacion;
        })
        ocupacionesEntidad = (ocupacionesEntidad.sort((a, b) => b.fin - a.fin)).sort((a, b) => b.inicio - a.inicio);
        ocupacionesEntidad.forEach(ocupacion => {
            const {
                id: idOcupacion,
                nombre: nombreOcupacion,
                detalle,
                inicio,
                fin
            } = ocupacion;
            const seccionOcupacion = `
            <div id="seccion-ocupacion-${idOcupacion}" class="seccion-ocupaciones d-flex flex-column flex-md-row justify-content-between mb-5 pl-4">
                <div class="flex-grow-1">
                    <h4 class="mb-3"><i>${nombreOcupacion}</i></h4>
                    <p>${detalle}</p>
                    <div class="seccion-logros">
                        <h5>Logros</h5>
                        <ul id="lista-logros-${idOcupacion}">
                        </ul>
                    </div>
                </div>
                <div class="flex-shrink-0"><span class="text-primary"><i>${inicio} - ${fin}</i></span></div>
            </div>
            `
            $(`#seccion-entidad-${id}`).append(seccionOcupacion);
            const experienciasOcupacion = experiencias.filter(experiencia => experiencia.ocupacion == idOcupacion && experiencia.entidad == id);
            experienciasOcupacion.forEach(experiencia => {
                const {
                    logro,
                    visible
                } = experiencia;
                if (visible) {
                    const seccionLogro = `
                    <li style="text-justify: auto;">${logro}</li>
                    `
                    $(`#lista-logros-${idOcupacion}`).append(seccionLogro);
                }
            })

        })
    });
}

function cargarEducacion() {
    formaciones.forEach(formacion=>{
        const {tipo,entidad,detalle,fin,visible}=formacion;
        if(visible){
            const seccionEducacion=`
            <div class="d-flex flex-column flex-md-row justify-content-between mb-5">
                <div class="flex-grow-1">
                    <h3 class="mb-0"><b>${entidad.toUpperCase()}</b></h3>
                    <div class="subheading mb-3"><i>${tipo}</i></div>
                    <p>${detalle}</p>
                </div>
                <div class="flex-shrink-0"><span class="text-primary">${fin}</span></div>
            </div>
            `
            $(".seccion-educacion").append(seccionEducacion);
        }
    })
}

function filtrarOcupaciones() {
    var ocupacionesUnicas = [];
    ocupaciones.forEach(ocupacion => {
        var i = ocupacionesUnicas.findIndex(x => x.entidad == ocupacion.entidad);
        if (i <= -1) {
            ocupacionesUnicas.push(ocupacion);
        }
    });
    return ocupacionesUnicas;
}