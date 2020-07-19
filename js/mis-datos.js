var modo = "actualizar";
var estados = {
    nombre: false,
    apellido: false,
    telefono: false,
    enlace: false,
    relevantes: false
}

const userId = localStorage.getItem("usuario");

//------------ Conexion a Backend -------------------//

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
                cargarCampos(data);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function putDatos(data) {
    axios.put(`https://tu-cv-api.herokuapp.com/misdatos`, data, {
            headers: {
                usuario: userId
            }
        })
        .then(function (res) {
            const {
                status
            } = res;
            if (status == 201) {
                window.location.reload(true);
            }
        })
        .catch(function (error) {
            console.log(error);
        })
}

function cargarCampos(data) {
    $("#input-nombre").val(data.nombre);
    $("#input-apellido").val(data.apellido);
    $("#input-telefono").val(data.telefono);
    $("#input-enlace").val(data.enlace);
    $("#input-relevantes").val(data.relevantes);
    contarPalabras(data.relevantes);
}


$("#btn-mis-datos").on('click', function (e) {
    e.preventDefault();

    switch (modo) {
        case "actualizar":
            modo = "guardar";
            $(".input-mis-datos").each(function (index) {
                $(this).removeAttr("disabled");
            });
            $("#btn-cancelar, #palabras").removeAttr("hidden");
            $(this).text("Guardar");
            if (camposVacios()) {
                $(this).attr("disabled", true)
            } else {
                for (campo of Object.keys(estados)) {
                    estados[campo] = true;
                }
            }
            break;

        case "guardar":
            const data = {
                nombre: $("#input-nombre").val(),
                apellido: $("#input-apellido").val(),
                telefono: $("#input-telefono").val(),
                enlace: $("#input-enlace").val(),
                relevantes: $("#input-relevantes").val()
            }
            putDatos(data);
            break;

        default:
            break;
    }
});

//--------------------- VALIDACION --------------------------//

$(".input-mis-datos").on('blur', function () {
    if (validar(this.value, this.dataset.campo)) {
        $(this).removeClass("is-invalid");
        $(this).addClass("is-valid")
    } else {
        $(this).removeClass("is-valid");
        $(this).addClass("is-invalid")
    }
    if (validarTodo()) {
        $("#btn-mis-datos").removeAttr("disabled");
    } else {
        $("#btn-mis-datos").attr("disabled", true)
    }
});

$("input").on('keyup', function () {
    const campo = this.dataset.campo;
    if (campo == "nombre" || campo == "apellido")
        if (this.value.length == 100) {
            $(`.limite-${campo}`).removeAttr("hidden");
        } else {
            $(`.limite-${campo}`).attr("hidden", true);
        }
});

$("textarea").on('keyup', function () {
    var words = 0;
    if (this.value !== "") {
        var words = this.value.match(/\S+/g).length;
    }
    if (words > 60) {
        // Split the string on first 30 words and rejoin on spaces
        var trimmed = $(this).val().split(/\s+/, 60).join(" ");
        // Add a space at the end to keep new typing making new words
        $(this).val(trimmed + " ");
    } else {
        $(`#restantes`).text(60 - words);
    }
});

function contarPalabras(texto) {
    var words = 0;
    if (texto !== "") {
        var words = texto.match(/\S+/g).length;
    }
    $(`#restantes`).text(60 - words);
}



function validar(valor, campo) {
    switch (campo) {
        case "nombre":
        case "apellido":
            if (/^[A-ZÑñ\s]+$/i.test(valor)) {
                estados[campo] = true;
                return true;
            } else {
                estados[campo] = false;
                return false;
            }

            case "telefono":
                if (/^[\d\s]{9}$/i.test(valor)) {
                    estados.telefono = true;
                    return true;
                } else {
                    estados.telefono = false;
                    return false;
                }

                case "enlace":
                    if (/^https:\/\/[a-z]{2,3}\.linkedin\.com\/.*$/gim.test(valor)) {
                        estados.enlace = true;
                        return true;
                    } else {
                        estados.enlace = false;
                        return false;
                    }

                    case "relevantes":
                        if (valor == "") {
                            estados.relevantes = false;
                            return false;
                        } else {
                            estados.relevantes = true;
                            return true;
                        }
                        default:
                            break;
    }
}

function camposVacios() {
    if ($("#input-nombre").val() != "") return false;
    if ($("#input-apellido").val() != "") return false;
    if ($("#input-telefono").val() != "") return false;
    if ($("#input-enlace").val() != "") return false;
    if ($("#input-relevantes").val() != "") return false;
    return true;
}

function validarTodo() {
    const values = Object.values(estados);
    for (value of values) {
        if (!value) {
            return false;
        }
    }
    return true;
}