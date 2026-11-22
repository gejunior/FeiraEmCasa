// Lista da semana. Para tirar um item, apague a linha. Unidades: "kg", "maço", "unid."
// Fotos: coloque o arquivo na pasta "imagens" com o mesmo nome do id, em .jpg (ex.: imagens/banana.jpg).
// Sem foto, aparece o emoji do campo "e". Para usar outro arquivo, adicione img: "imagens/outro-nome.png".
// Itens em kg andam de 0,5 em 0,5. Os preços abaixo são só exemplos: troque pelos seus.
const PRODUTOS = [
    {
        cat: "Frutas", itens: [
            { id: "banana", e: "🍌", nome: "Banana prata", un: "kg", preco: 6.50 },
            { id: "laranja", e: "🍊", nome: "Laranja", un: "kg", preco: 4.00 },
            { id: "mamao", e: "🥭", nome: "Mamão", un: "unid.", preco: 7.00 },
            { id: "limao", e: "🍋", nome: "Limão", un: "kg", preco: 5.00 },
            { id: "abacate", e: "🥑", nome: "Abacate", un: "unid.", preco: 6.00 }
        ]
    },
    {
        cat: "Legumes", itens: [
            { id: "tomate", e: "🍅", nome: "Tomate", un: "kg", preco: 7.00 },
            { id: "cenoura", e: "🥕", nome: "Cenoura", un: "kg", preco: 5.50 },
            { id: "batata", e: "🥔", nome: "Batata", un: "kg", preco: 6.00 },
            { id: "cebola", e: "🧅", nome: "Cebola", un: "kg", preco: 5.00 },
            { id: "abobrinha", e: "🥒", nome: "Abobrinha", un: "kg", preco: 6.50 },
            { id: "chuchu", e: "🍐", nome: "Chuchu", un: "kg", preco: 4.50 }
        ]
    },
    {
        cat: "Verduras", itens: [
            { id: "alface", e: "🥬", nome: "Alface crespa", un: "unid.", preco: 3.50 },
            { id: "couve", e: "🥬", nome: "Couve", un: "maço", preco: 3.00 },
            { id: "cheiro", e: "🌿", nome: "Cheiro-verde", un: "maço", preco: 2.50 },
            { id: "rucula", e: "🌱", nome: "Rúcula", un: "maço", preco: 3.50 },
            { id: "repolho", e: "🥬", nome: "Repolho", un: "unid.", preco: 6.00 }
        ]
    }
];