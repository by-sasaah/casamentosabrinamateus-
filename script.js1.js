import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue,
    runTransaction
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
   INICIAR QUANDO A PÁGINA CARREGAR
========================================================= */

document.addEventListener("DOMContentLoaded", function () {


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


    const body =
        document.body;


    /*
       Identifica automaticamente a categoria
       através de:

       <body data-categoria="cozinha">
    */

    const categoria =
        body.dataset.categoria;


    /*
       Se a página não for uma página
       de categoria, não faz nada.
    */

    if (!categoria) {
        return;
    }


    /*
       Se algum elemento essencial não existir,
       evita erro no JavaScript.
    */

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



    /* =====================================================
       VARIÁVEL DO CARTÃO SELECIONADO
    ===================================================== */

    let cardSelecionado = null;



    /* =====================================================
       FUNÇÃO — BLOQUEAR CARTÃO
    ===================================================== */

    function marcarComoEscolhido(
        card,
        dados
    ) {

        if (!card) {
            return;
        }


        card.classList.add(
            "escolhido"
        );


        const botao =
            card.querySelector(
                "button"
            );


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

            card.appendChild(
                status
            );

        }


        status.textContent =
            "Escolhido por " +
            dados.nome;

    }



    /* =====================================================
       FUNÇÃO — LIBERAR CARTÃO
    ===================================================== */

    function liberarCartao(card) {

        if (!card) {
            return;
        }


        card.classList.remove(
            "escolhido"
        );


        const botao =
            card.querySelector(
                "button"
            );


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
       ESCUTAR FIREBASE
    ===================================================== */

    const presentesRef =
        ref(
            db,
            "presentes/" + categoria
        );


    onValue(
        presentesRef,
        function (snapshot) {

            const dados =
                snapshot.val() || {};


            /*
               Atualiza todos os cartões
               existentes na página.
            */

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
                            dados[id]
                        ) {

                            marcarComoEscolhido(
                                card,
                                dados[id]
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

                    /*
                       Se já estiver desativado,
                       não abre novamente.
                    */

                    if (
                        botao.disabled
                    ) {
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


        cardSelecionado =
            null;


        nomeInput.value =
            "";

    }



    fecharModal.addEventListener(
        "click",
        fechar
    );


    cancelar.addEventListener(
        "click",
        fechar
    );



    /* =====================================================
       CLICAR FORA
    ===================================================== */

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

            if (
                !cardSelecionado
            ) {

                return;

            }


            const nome =
                nomeInput.value.trim();


            if (
                nome === ""
            ) {

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


            /*
               Referência específica do presente:

               presentes/
                   cozinha/
                       panela/
                   quarto-sala/
                       jogo-de-cama/
            */

            const presenteRef =
                ref(
                    db,
                    "presentes/" +
                    categoria +
                    "/" +
                    id
                );


            /*
               Desabilita temporariamente
               para evitar dois cliques.
            */

            confirmar.disabled =
                true;

            confirmar.textContent =
                "Salvando...";


            try {

                /*
                   TRANSACTION

                   Isso é importante porque impede
                   duas pessoas de escolherem o mesmo
                   presente ao mesmo tempo.
                */

                const resultado =
                    await runTransaction(
                        presenteRef,
                        function (
                            atual
                        ) {

                            /*
                               Se já existe alguém,
                               não altera.
                            */

                            if (
                                atual !== null
                            ) {

                                return;

                            }


                            /*
                               Primeiro a escolher
                               fica registrada.
                            */

                            return {

                                nome:
                                    nome,

                                presente:
                                    nomePresente,

                                categoria:
                                    categoria,

                                escolhidoEm:
                                    new Date()
                                        .toISOString()

                            };

                        }
                    );


                /*
                   Verifica se a transação foi
                   realmente confirmada.
                */

                if (
                    resultado.committed
                ) {

                    fechar();


                    alert(
                        "Presente escolhido com sucesso! ❤️"
                    );


                } else {

                    /*
                       Outra pessoa escolheu
                       antes.
                    */

                    fechar();


                    alert(
                        "Esse presente acabou de ser escolhido por outra pessoa. Escolha outro presente. ❤️"
                    );

                }

            }

            catch (erro) {

                console.error(
                    "Erro ao salvar presente:",
                    erro
                );


                alert(
                    "Não foi possível salvar a escolha. Verifique sua conexão e tente novamente."
                );

            }


            confirmar.disabled =
                false;

            confirmar.textContent =
                "Confirmar presente";

        }
    );



    /* =====================================================
       ENTER NO CAMPO DE NOME
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