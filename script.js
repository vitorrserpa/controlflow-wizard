
/* =====================================================
   CONFIGURAÇÃO
===================================================== */

const CHAVE_HISTORICO = "controleFaltasHistorico";


/* =====================================================
   DATA
===================================================== */

function obterDataHoje() {

    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


function formatarData(data) {

    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


/* =====================================================
   INICIALIZAÇÃO
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const campoData = document.getElementById("data-aula");

    campoData.value = obterDataHoje();

    carregarHistorico();

    atualizarTodosContadores();

    carregarAutomaticamente();

});


/* =====================================================
   CHECKBOXES
===================================================== */

function obterCheckboxes(idTurma) {

    const turma = document.getElementById(idTurma);

    return turma.querySelectorAll(
        'input[type="checkbox"]'
    );
}


/* =====================================================
   MARCAR TODOS
===================================================== */

function marcarTodos(idTurma) {

    const checkboxes = obterCheckboxes(idTurma);

    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });

    atualizarContador(idTurma);
}


/* =====================================================
   LIMPAR TODOS
===================================================== */

function limparTodos(idTurma) {

    const checkboxes = obterCheckboxes(idTurma);

    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    atualizarContador(idTurma);
}


/* =====================================================
   TODAS AS TURMAS
===================================================== */

function obterTurmas() {

    return document.querySelectorAll(".turma");

}


function marcarTodasTurmas() {

    obterTurmas().forEach(turma => {

        const checkboxes =
            turma.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });

        atualizarContador(turma.id);

    });

}


function limparTodasTurmas() {

    obterTurmas().forEach(turma => {

        const checkboxes =
            turma.querySelectorAll('input[type="checkbox"]');

        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });

        atualizarContador(turma.id);

    });

}


/* =====================================================
   CONTADOR
===================================================== */

function atualizarContador(idTurma) {

    const turma = document.getElementById(idTurma);

    const checkboxes =
        turma.querySelectorAll('input[type="checkbox"]');

    const total = checkboxes.length;

    const presentes =
        Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .length;

    const faltosos = total - presentes;


    turma.querySelector(".presentes").textContent =
        presentes;

    turma.querySelector(".faltosos").textContent =
        faltosos;


    const status = turma.querySelector(".status");

    if (presentes === 0) {

        status.textContent = "Aguardando chamada";

    } else if (faltosos === 0) {

        status.textContent = "✓ Todos presentes";

    } else {

        status.textContent =
            `${faltosos} aluno(s) faltoso(s)`;

    }

}


function atualizarTodosContadores() {

    obterTurmas().forEach(turma => {
        atualizarContador(turma.id);
    });

}


/* =====================================================
   SALVAR CHAMADA
===================================================== */

function salvarTodasTurmas() {

    const data =
        document.getElementById("data-aula").value;


    if (!data) {

        alert("Selecione uma data.");

        return;
    }


    const registros = [];


    obterTurmas().forEach(turma => {

        const checkboxes =
            turma.querySelectorAll('input[type="checkbox"]');


        const presentes =
            Array.from(checkboxes)
                .filter(c => c.checked)
                .map(c => c.value);


        const faltosos =
            Array.from(checkboxes)
                .filter(c => !c.checked)
                .map(c => c.value);


        registros.push({

            id: turma.id,

            turma:
                turma.querySelector("h2").textContent,

            presentes,

            faltosos

        });

    });


    const historico =
        obterHistorico();


    const novoRegistro = {

        data,

        turmas: registros

    };


    /*
       Se já existir uma chamada na mesma data,
       substitui a anterior.
    */

    const index =
        historico.findIndex(
            registro => registro.data === data
        );


    if (index >= 0) {

        historico[index] = novoRegistro;

    } else {

        historico.push(novoRegistro);

    }


    localStorage.setItem(
        CHAVE_HISTORICO,
        JSON.stringify(historico)
    );


    carregarHistorico();


    alert(
        `Chamada de ${formatarData(data)} salva com sucesso!`
    );

}


/* =====================================================
   HISTÓRICO
===================================================== */

function obterHistorico() {

    const dados =
        localStorage.getItem(CHAVE_HISTORICO);


    if (!dados) {
        return [];
    }


    return JSON.parse(dados);

}


function carregarHistorico() {

    const container =
        document.getElementById("lista-historico");


    const historico =
        obterHistorico();


    if (historico.length === 0) {

        container.innerHTML =
            `<p class="sem-historico">
                Nenhuma chamada salva ainda.
            </p>`;

        return;
    }


    /*
       Mais recente primeiro
    */

    historico.sort(
        (a, b) =>
            new Date(b.data) - new Date(a.data)
    );


    container.innerHTML = "";


    historico.forEach(registro => {

        const totalFaltas =
            registro.turmas.reduce(
                (total, turma) =>
                    total + turma.faltosos.length,
                0
            );


        const elemento =
            document.createElement("div");


        elemento.className = "registro";


        elemento.innerHTML = `

            <div class="registro-info">

                <strong>
                    ${formatarData(registro.data)}
                </strong>

                <span>
                    ${totalFaltas} falta(s) registrada(s)
                </span>

            </div>

            <div class="registro-acoes">

                <button
                    class="btn-carregar"
                    onclick="carregarRegistro('${registro.data}')">
                    Carregar
                </button>

                <button
                    class="btn-excluir"
                    onclick="excluirRegistro('${registro.data}')">
                    Excluir
                </button>

            </div>

        `;


        container.appendChild(elemento);

    });

}


/* =====================================================
   CARREGAR REGISTRO
===================================================== */

function carregarRegistro(data) {

    const historico =
        obterHistorico();


    const registro =
        historico.find(
            item => item.data === data
        );


    if (!registro) {
        return;
    }


    document.getElementById("data-aula").value =
        data;


    /*
       Primeiro limpa tudo
    */

    limparTodasTurmas();


    /*
       Depois restaura os presentes
    */

    registro.turmas.forEach(turmaSalva => {

        const turma =
            document.getElementById(turmaSalva.id);


        if (!turma) {
            return;
        }


        const checkboxes =
            turma.querySelectorAll(
                'input[type="checkbox"]'
            );


        checkboxes.forEach(checkbox => {

            checkbox.checked =
                turmaSalva.presentes.includes(
                    checkbox.value
                );

        });


        atualizarContador(turma.id);

    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =====================================================
   EXCLUIR REGISTRO
===================================================== */

function excluirRegistro(data) {

    const confirmar =
        confirm(
            `Excluir a chamada do dia ${formatarData(data)}?`
        );


    if (!confirmar) {
        return;
    }


    let historico =
        obterHistorico();


    historico =
        historico.filter(
            registro => registro.data !== data
        );


    localStorage.setItem(
        CHAVE_HISTORICO,
        JSON.stringify(historico)
    );


    carregarHistorico();

}


/* =====================================================
   CARREGAMENTO AUTOMÁTICO
===================================================== */

function carregarAutomaticamente() {

    const data =
        document.getElementById("data-aula").value;


    const historico =
        obterHistorico();


    const registro =
        historico.find(
            item => item.data === data
        );


    if (registro) {

        carregarRegistro(data);

    }

}



/* =====================================================
   GOOGLE SHEETS
===================================================== */

const URL_GOOGLE_SHEETS =
    "https://script.google.com/macros/s/AKfycbzGCT8MFtmoFWvoE68ugBVniRE5LtCNs103EKHBbFqD5h_pKFrXl4IQ_p3HDFwzOBHZoA/exec";



/* =====================================================
   SALVAR FALTAS NO GOOGLE SHEETS
===================================================== */

async function salvarNoGoogleSheets(idTurma) {

    const turma =
        document.getElementById(idTurma);


    const data =
        document.getElementById("data-aula").value;


    if (!data) {

        alert("Selecione a data da aula.");

        return;
    }


    const checkboxes =
        turma.querySelectorAll(
            'input[type="checkbox"]'
        );


    /*
       Pega somente os alunos
       que NÃO estão marcados.
    */

    const faltosos =
        Array.from(checkboxes)
            .filter(checkbox => !checkbox.checked)
            .map(checkbox => checkbox.value);


    if (faltosos.length === 0) {

        alert(
            "Não há faltas para salvar."
        );

        return;
    }


    const nomeTurma =
        turma.querySelector("h2").textContent;


    /*
       Dados que serão enviados
       para o Google Apps Script.
    */

    const dados = {

        data: formatarData(data),

        turma: nomeTurma,

        faltosos: faltosos

    };


    try {

        alert("Salvando faltas no Google Sheets...");


        const resposta =
            await fetch(
                URL_GOOGLE_SHEETS,
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "text/plain;charset=utf-8"
                    },

                    body: JSON.stringify(dados)

                }
            );


        const resultado =
            await resposta.json();


        if (resultado.sucesso) {

            alert(
                "✓ Faltas salvas no Google Sheets!"
            );

        } else {

            alert(
                "Erro ao salvar: " +
                resultado.erro
            );

        }


    } catch (erro) {

        console.error(erro);

        alert(
            "Não foi possível conectar ao Google Sheets."
        );

    }

}




/* =====================================================
   WHATSAPP
===================================================== */

function enviarFaltas(idTurma) {

    const turma =
        document.getElementById(idTurma);


    const data =
        document.getElementById("data-aula").value;


    if (!data) {

        alert("Selecione a data da aula.");

        return;
    }


    const checkboxes =
        turma.querySelectorAll(
            'input[type="checkbox"]'
        );


    /*
       Seleciona SOMENTE os não marcados
    */

    const faltosos =
        Array.from(checkboxes)
            .filter(checkbox => !checkbox.checked)
            .map(checkbox => checkbox.value);


    if (faltosos.length === 0) {

        alert(
            "Todos os alunos estão presentes!"
        );

        return;
    }


    const nomeTurma =
        turma.querySelector("h2").textContent;


    const lista =
        faltosos.join("\n");


    const mensagem =
        `Faltas dia ${formatarData(data)} - ${nomeTurma}\n\n` +
        `Alunos: ${lista}.`;


    const mensagemCodificada =
        encodeURIComponent(mensagem);


    const url =
        `https://wa.me/5524988397372?text=${mensagemCodificada}`;


    window.open(url, "_blank");

}


/* =====================================================
   SALVAMENTO AUTOMÁTICO
===================================================== */

document.addEventListener(
    "change",
    event => {

        if (
            event.target.matches(
                '.lista-alunos input[type="checkbox"]'
            )
        ) {

            const turma =
                event.target.closest(".turma");


            atualizarContador(turma.id);

        }

    }
);


/* =====================================================
   TROCA DE DATA
===================================================== */

document
    .getElementById("data-aula")
    .addEventListener(
        "change",
        () => {

            limparTodasTurmas();

            carregarAutomaticamente();

        }
    );

