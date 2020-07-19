var estados = {
    agregar: {
        entidad: false,
        ocupacion: false,
        logro: false
    },
    actualizar: {
        entidad: true,
        ocupacion: true,
        logro: true
    }
}

let ocupaciones;

let entidades;

let experiencias;

const userId = localStorage.getItem("usuario");

//--------------------- Conexion a Backend ---------------------//

$(document).ready(function () {
    getEntidades();
});

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
                cargarTabla();
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function postExperiencia(data) {
    axios.post('https://tu-cv-api.herokuapp.com/experiencias', data, {
            headers: {
                usuario: `${userId}`
            }
        })
        .then(function (res) {
            if (res.status == 201) {
                window.location.reload(true);
            }
        })
        .catch(function (error) {
            console.log(error);
        })
}

function putExperiencia(id, data) {
    axios.put(`https://tu-cv-api.herokuapp.com/experiencias/${id}`, data, {
            headers: {
                usuario: `${userId}`
            }
        })
        .then(function (res) {
            if (res.status == 201) {
                window.location.reload(true);
            }
        })
        .catch(function (error) {
            console.log(error);
        })
}

function deleteExperiencia(id, faltaEntidad = false) {
    axios.delete(`https://tu-cv-api.herokuapp.com/experiencias/${id}`, {
            headers: {
                usuario: userId
            }
        })
        .then(function (res) {
            if (res.status == 200) {
                if (!faltaEntidad) window.location.reload(true);
                console.log("Experiencia eliminada");
            }
        })
        .catch(function (error) {
            console.log(error);
        })
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
                entidades = data.sort(comparar);
                cargarSelectEntidad();
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
                ocupaciones = data.sort(comparar);
                getExperiencias();
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function getEntidad(id) {
    return entidades.find(entidad => entidad.id == id);
}

function getOcupacion(id) {
    return ocupaciones.find(ocupacion => ocupacion.id == id);
}

function cargarTabla() {
    let count = 0;
    $("tbody").children("tr").remove();
    experiencias.forEach(experiencia => {
        if (getEntidad(experiencia.entidad) == undefined) {
            deleteExperiencia(experiencia.id, true);
            return;
        }
        if (getOcupacion(experiencia.ocupacion) == undefined) {
            deleteExperiencia(experiencia.id, true);
            return;
        }
        count++;
        const id = experiencia.id;
        const entidad = getEntidad(experiencia.entidad).nombre;
        const ocupacion = getOcupacion(experiencia.ocupacion).nombre;
        const fecha = obtenerFecha(getOcupacion(experiencia.ocupacion).fin);
        const fila = `
        <tr data-id="${id}">
            <th id="count" scope="row">${count}</th>
            <td>${entidad}</td>
            <td>${ocupacion}</td>
            <td style="text-align: center;">${fecha}</td>
            <td style="text-align: center;"><button type="button" class="edit-button"><i class="far fa-edit"></i></button> | <button class="delete-button"><i class="fas fa-trash"></i></button>
        </tr>
        `
        $("tbody").append(fila);
        ordenarTabla();
    });

    $(".edit-button").on('click', function () {
        const experienciaId = $(this).closest("tr")[0].dataset.id;
        const experiencia = experiencias.find(exp => exp.id == experienciaId);
        cargarSelectOcupacion(experiencia.entidad, "actualizar");
        $("#select-entidad-actualizar").val(experiencia.entidad);
        $("#select-ocupacion-actualizar").val(experiencia.ocupacion);
        $("#input-logro-actualizar").val(experiencia.logro);
        $("#check-visible-actualizar").prop("checked", experiencia.visible);
        $("#btn-actualizar").data("id", experienciaId);
        $("#actualizar-modal").modal('show');
    });

    $(".delete-button").on('click', function () {
        const experienciaId = $(this).closest("tr")[0].dataset.id;
        deleteExperiencia(experienciaId);
    });
}

function cargarSelectEntidad() {
    entidades.forEach(entidad => {
        $(".select-experiencia.entidad").append(`<option value=${entidad.id}>${entidad.nombre}</option>`)
    })
}

function cargarSelectOcupacion(id, modal) {
    const ocupacionesEntidad = ocupaciones.filter(ocupacion => ocupacion.entidad == id);
    $(".select-experiencia.ocupacion").children("option.opt").remove();
    ocupacionesEntidad.forEach(ocupacion => {
        if (modal == "agregar") {
            $(`#select-ocupacion`).append(`<option class="opt" value=${ocupacion.id}>${ocupacion.nombre}</option>`);
        } else {
            $(`#select-ocupacion-actualizar`).append(`<option class="opt" value=${ocupacion.id}>${ocupacion.nombre}</option>`);
        }
    });
}

$(".select-experiencia.entidad").on('change', function () {
    const modal = this.dataset.modal;
    cargarSelectOcupacion(this.value, modal);
    $(".select-experiencia.ocupacion").removeClass("is-invalid");
    $(".select-experiencia.ocupacion").removeClass("is-valid");
    $(".select-experiencia.ocupacion").val("Seleccione Ocupacion...");
    estados[modal].ocupacion = false;
    if (modal == "agregar") $("#select-ocupacion").removeAttr('disabled');
})

$("#btn-agregar").on('click', function (e) {
    e.preventDefault();
    const data = {
        entidad: $("#select-entidad").val(),
        ocupacion: $("#select-ocupacion").val(),
        logro: $("#input-logro").val(),
        visible: $("#check-visible-agregar").is(":checked")
    }
    postExperiencia(data);
});

$("#btn-actualizar").on('click', function (e) {
    e.preventDefault();
    const idExperiencia = $(this).data("id");
    const data = {
        entidad: $("#select-entidad-actualizar").val(),
        ocupacion: $("#select-ocupacion-actualizar").val(),
        logro: $("#input-logro-actualizar").val(),
        visible: $("#check-visible-actualizar").is(":checked")
    }
    putExperiencia(idExperiencia, data);
});

function obtenerFecha(fecha) {
    return new Date(fecha).getFullYear();
}

//--------------------- Validacion ---------------------//

$(".select-experiencia").on('change', function () {
    const modal = this.dataset.modal;
    const campo = this.dataset.campo;
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
    estados[modal][campo] = true;
    if (validarTodo(modal)) {
        $(`#btn-${modal}`).removeAttr("disabled");
    } else {
        $(`#btn-${modal}`).attr("disabled", true);
    }
});

$(".select-experiencia").on('blur', function () {
    if (this.value == "Seleccione Entidad..." || this.value == "Seleccione Ocupacion...") {
        $(this).removeClass("is-valid");
        $(this).addClass("is-invalid");
    }
});

$(".input-experiencia").on('blur', function () {
    const modal = this.dataset.modal;
    const campo = this.dataset.campo;
    if (this.value == "") {
        $(this).removeClass("is-valid");
        $(this).addClass("is-invalid");
        estados[modal][campo] = false;
    } else {
        $(this).removeClass("is-invalid");
        $(this).addClass("is-valid")
        estados[modal][campo] = true;
    }

    if (validarTodo(modal)) {
        $(`#btn-${modal}`).removeAttr("disabled");
    } else {
        $(`#btn-${modal}`).attr("disabled", true);
    }
});

$("textarea").on('keyup', function () {
    var words = 0;
    if (this.value !== "") {
        var words = this.value.match(/\S+/g).length;
    }
    if (words > 30) {
        // Split the string on first 30 words and rejoin on spaces
        var trimmed = $(this).val().split(/\s+/, 30).join(" ");
        // Add a space at the end to keep new typing making new words
        $(this).val(trimmed + " ");
    } else {
        $(`#restantes-${this.dataset.modal}`).text(30 - words);
    }
});

function validarTodo(modal) {
    const valores = Object.values(estados[modal]);
    for (valor of valores) {
        if (!valor) return false;
    }
    return true;
}

//----------------- Ordenar Lista -------------------//

function comparar(a, b) {
    if (a.nombre < b.nombre) {
        return -1;
    }
    if (a.nombre > b.nombre) {
        return 1;
    }
    return 0;
}

function ordenarTabla() {
    let count = 0;

    var filas = $("table tbody tr").detach().get();

    filas.sort(compararFilas);

    filas.forEach(fila => {
        count++;
        $(fila).find("#count").text(count);
    })

    $("table tbody").append(filas);
}

function compararFilas(fila1, fila2) {
    let v1, v2, r;
    v1 = $(fila1).find("td:eq(0)").text();
    v2 = $(fila2).find("td:eq(0)").text();
    if (v1 < v2) {
        r = -1;
    } else if (v1 > v2) {
        r = 1;
    } else {
        r = 0;
    }
    if (r === 0) {
        v1 = $(fila1).find("td:eq(2)").text();
        v2 = $(fila2).find("td:eq(2)").text();
        r = v2 - v1;
    }
    return r;
}

$("#formulario-agregar").on('reset', function () {
    for (campo of Object.keys(estados.agregar)) {
        estados.agregar[campo] = false;
    }
    $(`#restantes-agregar`).text(30);
    $(`#btn-agregar`).attr("disabled", true);
});