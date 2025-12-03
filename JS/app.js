
let productos = [];
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

const contenedorProductos = document.getElementById("productos");
const listaCarrito     = document.getElementById("lista-carrito");
const totalCompra      = document.getElementById("total");
const btnVaciar        = document.getElementById("vaciar-carrito");
const btnFinalizar     = document.getElementById("finalizar-compra");

const JSON_RUTA = "./data/productos.json";



// Cargado de productos desde el JSON
async function cargarProductos() {
    try {
        const resp = await fetch(JSON_RUTA);
        if (!resp.ok) throw new Error("No se pudieron cargar los productos");

        productos = await resp.json();
        mostrarProductos();
        actualizarCarrito();
    } catch (error) {
        Swal.fire("Error", "No se pudo cargar el catálogo", "error");
        console.error(error);
    }
}


// Función para img de los productos
function mostrarProductos() {
    contenedorProductos.innerHTML = "";

    productos.forEach(prod => {
        const card = document.createElement("div");
        card.classList.add("producto");

        card.innerHTML = `
            <img src="${prod.imagen}" alt="${prod.nombre}">
            <h3>${prod.nombre}</h3>
            <p>Precio: $${prod.precio.toLocaleString()}</p>
            <button class="btn-agregar" data-id="${prod.id}">
                Agregar al carrito
            </button>
        `;

        contenedorProductos.appendChild(card);
    });
}


// Funcion para agregar productos al carrito
function agregarAlCarrito(id) {

    if (!Number.isInteger(id)) {
        Swal.fire("Error", "ID de producto inválido", "error");
        return;
    }

    const producto = productos.find(p => p.id === id);

    if (!producto) {
        Swal.fire("Error", "El producto no existe", "error");
        return;
    }

    const existe = carrito.find(item => item.id === id);

    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }

    actualizarCarrito();

    Swal.fire({
        toast: true,
        icon: "success",
        title: "Producto agregado",
        timer: 1500,
        showConfirmButton: false,
        position: "top-end"
    });
}



// Función de actualizar carrito
function actualizarCarrito() {

    listaCarrito.innerHTML = "";
    let total = 0;

    carrito.forEach(item => {
        const li = document.createElement("li");

        li.innerHTML = `
            ${item.nombre} - $${item.precio.toLocaleString()} 
            <span> x ${item.cantidad} </span>

            <button class="sumar" data-id="${item.id}">+</button>
            <button class="restar" data-id="${item.id}">−</button>
            <button class="eliminar" data-id="${item.id}">Eliminar</button>
        `;

        listaCarrito.appendChild(li);
        total += item.precio * item.cantidad;
    });

    totalCompra.textContent = `Total: $${total.toLocaleString()}`;
    localStorage.setItem("carrito", JSON.stringify(carrito));
}


// Manejo de botones de carrito
listaCarrito.addEventListener("click", (e) => {

    const id = parseInt(e.target.dataset.id);

    if (e.target.classList.contains("sumar")) {
        const item = carrito.find(p => p.id === id);
        item.cantidad++;
    }

    else if (e.target.classList.contains("restar")) {
        const item = carrito.find(p => p.id === id);

        item.cantidad--;

        if (item.cantidad <= 0) {
            carrito = carrito.filter(p => p.id !== id);
        }
    }

    else if (e.target.classList.contains("eliminar")) {
        carrito = carrito.filter(p => p.id !== id);
    }

    actualizarCarrito();
});


// Botón "Vaciar carrito"
btnVaciar.addEventListener("click", () => {

    if (carrito.length === 0) {
        Swal.fire("Atención", "El carrito ya está vacío", "info");
        return;
    }

    Swal.fire({
        icon: "warning",
        title: "¿Vaciar carrito?",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "Cancelar"
    }).then(res => {
        if (res.isConfirmed) {
            carrito = [];
            actualizarCarrito();
            localStorage.removeItem("carrito");
            Swal.fire("Listo", "Carrito vaciado", "success");
        }
    });
});


// Botón de finalizar compra
btnFinalizar.addEventListener("click", () => {
    if (carrito.length === 0) {
        Swal.fire("Error", "No hay productos en el carrito", "error");
        return;
    }

    Swal.fire({
        icon: "question",
        title: "¿Confirmar compra?",
        text: "Serás redirigido al pago simulado",
        showCancelButton: true
    }).then(res => {
        if (res.isConfirmed) {
            carrito = [];
            actualizarCarrito();
            localStorage.removeItem("carrito");
            Swal.fire("Gracias", "Compra realizada con éxito", "success");
        }
    });
});


// Evento: Agregar productos
contenedorProductos.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-agregar")) {
        const id = parseInt(e.target.dataset.id);
        agregarAlCarrito(id);
    }
});


// INICIALIZACIÓN
cargarProductos();
