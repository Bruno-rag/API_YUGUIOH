// Encontre o botão e os elementos de seleção
const btnEnviar = document.getElementById('btn-enviar');
const filtroTipo = document.getElementById('filtro-tipo');
const filtroNivel = document.getElementById('filtro-nivel');
const filtroAtributo = document.getElementById('filtro-atributo');

// Encontre o novo contêiner de resultados
const cardResultsContainer = document.getElementById('card-results-container');

function buscarDadosAPI() {
    // Limpa os resultados anteriores antes de uma nova pesquisa
    cardResultsContainer.innerHTML = '';

    // 1. Obtenha os valores selecionados
    const tipoSelecionado = filtroTipo.value;
    const nivelSelecionado = filtroNivel.value;
    const atributoSelecionado = filtroAtributo.value;

    // 2. Crie um objeto para os parâmetros de busca
    const params = {};
    if (tipoSelecionado) {
        params.type = tipoSelecionado;
    }
    if (nivelSelecionado) {
        params.level = nivelSelecionado;
    }
    if (atributoSelecionado) {
        params.attribute = atributoSelecionado;
    }

    if (Object.keys(params).length === 0) {
        alert("Por favor, selecione pelo menos um filtro.");
        return;
    }

    // 3. Constrói a URL da API com os parâmetros
    const query = new URLSearchParams(params).toString();
    const apiUrl = `https://db.ygoprodeck.com/api/v7/cardinfo.php?${query}`;

    // 4. Realiza a requisição fetch com a URL dinâmica
    fetch(apiUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro na requisição da API: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        if (data.data && data.data.length > 0) {
            // 5. Itera sobre os resultados (no máximo 3)
            for (let i = 0; i < 3 && i < data.data.length; i++) {
                const cardInfo = data.data[i];

                // 6. Cria um novo elemento div para cada card
                const cardDiv = document.createElement('div');
                cardDiv.classList.add('card'); // Adiciona uma classe para estilização futura se quiser

                // Cria os elementos do card: título, imagem e preços
                const cardName = document.createElement('h2');
                cardName.textContent = cardInfo.name;

                const cardImage = document.createElement('img');
                cardImage.src = cardInfo.card_images[0].image_url;
                cardImage.alt = cardInfo.name;
                cardImage.style.maxWidth = '300px';

                const cardPrices = document.createElement('div');
                cardPrices.innerHTML = '<h3>Preços:</h3>';
                
                // Adiciona os preços de marketplaces
                if (cardInfo.card_prices && cardInfo.card_prices.length > 0) {
                    const prices = cardInfo.card_prices[0];
                    const tcgPrice = document.createElement('p');
                    tcgPrice.textContent = `TCGPlayer: US$ ${prices.tcgplayer_price}`;
                    cardPrices.appendChild(tcgPrice);

                    const cardmarketPrice = document.createElement('p');
                    cardmarketPrice.textContent = `Cardmarket: US$ ${prices.cardmarket_price}`;
                    cardPrices.appendChild(cardmarketPrice);
                    
                    const ebayPrice = document.createElement('p');
                    ebayPrice.textContent = `eBay: US$ ${prices.ebay_price}`;
                    cardPrices.appendChild(ebayPrice);
                } else {
                    const noPriceMessage = document.createElement('p');
                    noPriceMessage.textContent = 'Preço não disponível.';
                    cardPrices.appendChild(noPriceMessage);
                }

                // Adiciona todos os elementos ao novo div do card
                cardDiv.appendChild(cardName);
                cardDiv.appendChild(cardImage);
                cardDiv.appendChild(cardPrices);

                // 7. Adiciona o div do card ao contêiner principal na página
                cardResultsContainer.appendChild(cardDiv);
            }
        } else {
            const noResultMessage = document.createElement('p');
            noResultMessage.textContent = 'Nenhum card encontrado com esses filtros.';
            cardResultsContainer.appendChild(noResultMessage);
        }
    })
    .catch(error => {
        console.error('Ocorreu um erro:', error);
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Erro ao buscar dados. Tente novamente.';
        cardResultsContainer.appendChild(errorMessage);
    });
}

// Adiciona o evento de clique ao botão
btnEnviar.addEventListener('click', buscarDadosAPI);