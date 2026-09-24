import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue,
    runTransaction,
    update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";


/* =========================================================
   FIREBASE
========================================================= */

const firebaseConfig = {

    apiKey:
        "AIzaSyB-TtYGS7XFKanoV5V_xFVi-3ev5W1mdSE",

    authDomain:
        "chadepanelasabrinaemateus.firebaseapp.com",

    databaseURL:
        "https://chadepanelasabrinaemateus-default-rtdb.firebaseio.com",

    projectId:
        "chadepanelasabrinaemateus",

    storageBucket:
        "chadepanelasabrinaemateus.firebasestorage.app",

    messagingSenderId:
        "491483759100",

    appId:
        "1:491483759100:web:291a7def5d0850744bf279",

    measurementId:
        "G-NETCX349ME"
};


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


/* =========================================================
   INICIAR
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const body = document.body;
    const categoria = body.dataset.categoria;

    if (!categoria) {
        return;
    }


    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const botoes =
        document.querySelectorAll(
            ".presente-card button"
        );

    const modal =
        document.getElementById(
            "modal-presente"
        );

    const fecharModal =
        document.getElementById(
            "fechar-modal"
        );

    const cancelar =
        document.getElementById(
            "modal-cancelar"
        );

    const nomePresenteModal =
        document.getElementById(
            "modal-nome-presente"
        );

    const nomeInput =
        document.getElementById(
            "nome-convidado"
        );

    const confirmar =
        document.getElementById(
            "modal-confirmar"
        );


    if (
        !modal ||
        !fecharModal ||
        !cancelar ||
        !nomePresenteModal ||
        !nomeInput ||
        !confirmar
    ) {

        console.warn(
            "Elementos do modal não encontrados."
        );

        return;
    }


    let cardSelecionado = null;


    /* =====================================================
       MARCAR COMO ESCOLHIDO
       
       IMPORTANTE:
       Não mostra o nome da pessoa.
    ===================================================== */

    function marcarComoEscolhido(card) {

        if (!card) {
            return;
        }

        card.classList.add("escolhido");

        const botao =
            card.querySelector("button");

        if (botao) {

            botao.textContent =
                "Presente já escolhido";

            botao.disabled = true;
        }


        let status =
            card.querySelector(
                ".presente-status"
            );

        if (!status) {

            status =
                document.createElement(
                    "div"
                );

            status.className =
                "presente-status";

            card.appendChild(status);
        }

        /*
           NÃO colocamos o nome aqui.
        */

        status.textContent =
            "Este presente já foi escolhido.";
    }


    /* =====================================================
       LIBERAR CARTÃO
    ===================================================== */

    function liberarCartao(card) {

        if (!card) {
            return;
        }

        card.classList.remove("escolhido");

        const botao =
            card.querySelector("button");

        if (botao) {

            botao.textContent =
                "Escolher presente";

            botao.disabled = false;
        }

        const status =
            card.querySelector(
                ".presente-status"
            );

        if (status) {
            status.remove();
        }
    }


    /* =====================================================
       STATUS PÚBLICO DOS PRESENTES
       
       Aqui NÃO existem nomes.
       
       Caminho:
       status-presentes/cozinha/presente-001
    ===================================================== */

    const statusRef =
        ref(
            db,
            "status-presentes/" + categoria
        );


    onValue(
        statusRef,
        function (snapshot) {

            const dados =
                snapshot.val() || {};

            document
                .querySelectorAll(
                    ".presente-card"
                )
                .forEach(
                    function (card) {

                        const id =
                            card.dataset.id;

                        if (
                            id &&
                            dados[id] &&
                            dados[id].escolhido === true
                        ) {

                            marcarComoEscolhido(
                                card
                            );

                        } else {

                            liberarCartao(
                                card
                            );
                        }
                    }
                );
        },
        function (erro) {

            console.error(
                "Erro ao carregar presentes:",
                erro
            );
        }
    );


    /* =====================================================
       ABRIR MODAL
    ===================================================== */

    botoes.forEach(
        function (botao) {

            botao.addEventListener(
                "click",
                function () {

                    if (botao.disabled) {
                        return;
                    }

                    cardSelecionado =
                        botao.closest(
                            ".presente-card"
                        );

                    if (!cardSelecionado) {
                        return;
                    }

                    const nomePresente =
                        cardSelecionado
                            .querySelector("h3")
                            .textContent
                            .trim();

                    nomePresenteModal.textContent =
                        nomePresente;

                    nomeInput.value = "";

                    modal.classList.add(
                        "aberto"
                    );

                    setTimeout(
                        function () {
                            nomeInput.focus();
                        },
                        100
                    );
                }
            );
        }
    );


    /* =====================================================
       FECHAR MODAL
    ===================================================== */

    function fechar() {

        modal.classList.remove(
            "aberto"
        );

        cardSelecionado = null;
        nomeInput.value = "";
    }


    fecharModal.addEventListener(
        "click",
        fechar
    );

    cancelar.addEventListener(
        "click",
        fechar
    );


    modal.addEventListener(
        "click",
        function (evento) {

            if (
                evento.target === modal
            ) {
                fechar();
            }
        }
    );


    /* =====================================================
       CONFIRMAR PRESENTE
    ===================================================== */

    confirmar.addEventListener(
        "click",
        async function () {

            if (!cardSelecionado) {
                return;
            }


            const nome =
                nomeInput.value.trim();


            if (!nome) {

                alert(
                    "Digite seu nome para continuar."
                );

                nomeInput.focus();

                return;
            }


            const id =
                cardSelecionado.dataset.id;


            const nomePresente =
                cardSelecionado
                    .querySelector("h3")
                    .textContent
                    .trim();


            if (!id) {

                alert(
                    "Este presente não possui um identificador."
                );

                return;
            }


            confirmar.disabled = true;
            confirmar.textContent = "Salvando...";


            try {

                /*
                   PRIMEIRO:

                   Reserva o presente no status público.

                   Não existe nome aqui.
                */

                const presenteStatusRef =
                    ref(
                        db,
                        "status-presentes/" +
                        categoria +
                        "/" +
                        id
                    );


                const resultado =
                    await runTransaction(
                        presenteStatusRef,
                        function (atual) {

                            /*
                               Se já foi escolhido,
                               não altera.
                            */

                            if (atual !== null) {
                                return;
                            }


                            return {
                                escolhido: true
                            };
                        }
                    );


                if (!resultado.committed) {

                    fechar();

                    alert(
                        "Esse presente acabou de ser escolhido por outra pessoa. Escolha outro presente. ❤️"
                    );

                    return;
                }


                /*
                   SEGUNDO:

                   Salva os dados da pessoa
                   em uma área separada.

                   Essa área NÃO será lida
                   pelo site dos convidados.
                */

                const reservaRef =
                    ref(
                        db,
                        "reservas/" +
                        categoria +
                        "/" +
                        id
                    );


                await update(
                    reservaRef,
                    {
                        nome: nome,
                        presente: nomePresente,
                        categoria: categoria,
                        escolhidoEm:
                            new Date().toISOString()
                    }
                );


                fechar();


                alert(
                    "Presente escolhido com sucesso! ❤️"
                );


            } catch (erro) {

                console.error(
                    "Erro ao salvar presente:",
                    erro
                );


                /*
                   Se o status foi salvo mas os dados
                   privados falharam, avisamos.
                */

                alert(
                    "Não foi possível finalizar a escolha. Tente novamente."
                );
            }


            confirmar.disabled = false;
            confirmar.textContent =
                "Confirmar escolha";
        }
    );


    /* =====================================================
       ENTER
    ===================================================== */

    nomeInput.addEventListener(
        "keydown",
        function (evento) {

            if (
                evento.key === "Enter"
            ) {

                evento.preventDefault();

                confirmar.click();
            }
        }
    );

});
