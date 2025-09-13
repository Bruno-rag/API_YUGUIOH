const btnEnviar = document.getElementById('btn-enviar');
const filtroAtributo = document.getElementById('filtro-atributo');
const cardResultsContainer = document.getElementById('card-results-container');

// Função para buscar cartas por atributo
async function buscarPorAtributo(atributo) {
    try {
        const apiUrl = `https://db.ygoprodeck.com/api/v7/cardinfo.php?attribute=${atributo}`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Erro na requisição da API: ' + response.statusText);
        }
        return await response.json();
    } catch (error) {
        console.error('Erro ao buscar cartas:', error);
        throw error;
    }
}

// Função principal para buscar e exibir cartas por atributo
function buscarCartas() {
    // Limpa os resultados anteriores
    cardResultsContainer.innerHTML = '';

    const atributoSelecionado = filtroAtributo.value;

    if (!atributoSelecionado) {
        alert("Por favor, selecione um atributo de carta.");
        return;
    }

    buscarPorAtributo(atributoSelecionado)
        .then(data => {
            if (data.data && data.data.length > 0) {
                // Exibe até 3 cartas dos resultados
                for (let i = 0; i < 3 && i < data.data.length; i++) {
                    const cardInfo = data.data[i];

                    // Cria um novo elemento div para cada card
                    const cardDiv = document.createElement('div');
                    cardDiv.classList.add('card');

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

                    // Adiciona todos os elementos ao div do card
                    cardDiv.appendChild(cardName);
                    cardDiv.appendChild(cardImage);
                    cardDiv.appendChild(cardPrices);

                    // Adiciona o div do card ao contêiner principal
                    cardResultsContainer.appendChild(cardDiv);
                }
            } else {
                const noResultMessage = document.createElement('p');
                noResultMessage.textContent = 'Nenhum card encontrado com esse atributo.';
                cardResultsContainer.appendChild(noResultMessage);
            }
        })
        .catch(error => {
            const errorMessage = document.createElement('p');
            errorMessage.textContent = 'Erro ao buscar cartas: ' + error.message;
            cardResultsContainer.appendChild(errorMessage);
        });
}

// Adiciona o evento de clique ao botão
btnEnviar.addEventListener('click', buscarCartas);