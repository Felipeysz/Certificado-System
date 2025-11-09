// ===== CONFIG NOME ALUNO - Responsável pela configuração do nome do aluno =====
document.addEventListener('DOMContentLoaded', function () {
    // ===== ELEMENTOS DO DOM =====
    const elements = {
        form: document.getElementById('certificateForm'),
        submitBtn: document.querySelector('#certificateForm button[type="submit"]'),
        saveConfigBtn: document.getElementById('saveConfigBtn'),
        nomeAlunoPreview: document.getElementById('nomeAlunoPreview'),
        draggableNomeAluno: document.getElementById('draggableNomeAluno'),
        nomeAlunoText: document.getElementById('nomeAlunoText'),
        nomeAlunoConfigInput: document.getElementById('NomeAlunoConfig'),
        certificatePreview: document.getElementById('certificatePreview'),
        positionInfo: document.getElementById('positionInfo'),
        posX: document.getElementById('posX'),
        posY: document.getElementById('posY'),
        toggleDraggables: document.getElementById('toggleDraggables'),
        // Controles de estilo
        fontSelector: document.getElementById('draggableFont'),
        fontSizeInput: document.getElementById('draggableFontSize'),
        fontColorInput: document.getElementById('draggableFontColor'),
        fontWeightInput: document.getElementById('draggableFontWeight'),
        textAlignSelector: document.getElementById('draggableTextAlign')
    };

    // Validação de elementos essenciais
    if (!elements.form || !elements.certificatePreview) {
        console.error('Erro: elementos principais não encontrados.');
        return;
    }

    // Estado
    let isLocked = false;
    let baseFontSize = 24;
    let isDragging = false;
    let isInitialized = false; // ⭐ Previne re-inicializações
    let savedPosition = { x: 0, y: 0 }; // ⭐ Salva posição durante ajustes

    // Desabilita submit até salvar configuração
    if (elements.submitBtn) elements.submitBtn.disabled = true;

    // ⭐ DETECTA NAVEGADOR (Chrome tem bugs específicos)
    const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    console.log(`🌐 Navegador: ${isChrome ? 'Chrome' : 'Outro'}`);

    // ===== FUNÇÃO DE AUTO-AJUSTE DE FONTE =====
    const autoAdjustFontSize = () => {
        if (isDragging || isLocked) return;
        if (!elements.nomeAlunoText || !elements.draggableNomeAluno) return;

        // ⭐ Salva posição atual antes de ajustar
        savedPosition = {
            x: parseFloat(elements.draggableNomeAluno.getAttribute('data-x')) || 0,
            y: parseFloat(elements.draggableNomeAluno.getAttribute('data-y')) || 0
        };

        const containerWidth = elements.draggableNomeAluno.offsetWidth || 400;
        baseFontSize = parseInt(elements.fontSizeInput?.value) || 24;
        let currentFontSize = baseFontSize;

        elements.nomeAlunoText.style.fontSize = currentFontSize + 'px';
        elements.nomeAlunoText.style.whiteSpace = 'nowrap';

        let textWidth = elements.nomeAlunoText.scrollWidth;

        while (textWidth > containerWidth && currentFontSize > 8) {
            currentFontSize -= 1;
            elements.nomeAlunoText.style.fontSize = currentFontSize + 'px';
            textWidth = elements.nomeAlunoText.scrollWidth;
        }

        if (elements.fontSizeInput && currentFontSize !== baseFontSize) {
            elements.fontSizeInput.value = currentFontSize;
        }

        // ⭐ RESTAURA posição após ajuste (Chrome bug fix)
        requestAnimationFrame(() => {
            if (elements.draggableNomeAluno) {
                elements.draggableNomeAluno.style.transform = `translate(${savedPosition.x}px, ${savedPosition.y}px)`;
                elements.draggableNomeAluno.setAttribute('data-x', savedPosition.x);
                elements.draggableNomeAluno.setAttribute('data-y', savedPosition.y);
            }
        });

        console.log(`📏 Auto-ajuste: ${baseFontSize}px → ${currentFontSize}px`);
    };

    // ===== FUNÇÕES DE TEXTO =====
    const updateNomeAlunoText = () => {
        if (!elements.nomeAlunoText) return;

        // ⭐ Salva posição antes de atualizar
        if (isInitialized) {
            savedPosition = {
                x: parseFloat(elements.draggableNomeAluno?.getAttribute('data-x')) || 0,
                y: parseFloat(elements.draggableNomeAluno?.getAttribute('data-y')) || 0
            };
        }

        elements.nomeAlunoText.textContent = elements.nomeAlunoPreview?.value || 'João da Silva';

        if (!isDragging && !isLocked) {
            setTimeout(() => {
                autoAdjustFontSize();
            }, 50);
        }
    };

    const updateNomeAlunoStyle = () => {
        if (!elements.nomeAlunoText) return;

        // ⭐ Salva posição antes de atualizar
        if (isInitialized) {
            savedPosition = {
                x: parseFloat(elements.draggableNomeAluno?.getAttribute('data-x')) || 0,
                y: parseFloat(elements.draggableNomeAluno?.getAttribute('data-y')) || 0
            };
        }

        const styles = {
            fontFamily: elements.fontSelector?.value || 'Arial',
            fontSize: (elements.fontSizeInput?.value || 24) + 'px',
            color: elements.fontColorInput?.value || '#000000',
            fontWeight: elements.fontWeightInput?.checked ? 'bold' : 'normal',
            textAlign: elements.textAlignSelector?.value || 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        };

        Object.assign(elements.nomeAlunoText.style, styles);
        baseFontSize = parseInt(elements.fontSizeInput?.value) || 24;

        if (!isDragging && !isLocked) {
            setTimeout(() => {
                autoAdjustFontSize();
            }, 50);
        }
    };

    // ===== DRAGGABLE COM INTERACT.JS =====
    const initializeDraggable = () => {
        if (!elements.draggableNomeAluno || !window.interact) {
            console.warn('⚠️ Interact.js não encontrado');
            return;
        }

        // ⭐ Previne múltiplas inicializações
        if (isInitialized) {
            console.log('✅ Draggable já inicializado');
            return;
        }

        // ⭐ Remove listeners anteriores (Chrome fix)
        try {
            interact(elements.draggableNomeAluno).unset();
        } catch (e) {
            // Ignora se não houver listeners
        }

        interact(elements.draggableNomeAluno).draggable({
            inertia: false,
            modifiers: [
                interact.modifiers.restrictRect({
                    restriction: 'parent',
                    endOnly: false // ⭐ Restrição contínua (sem inércia)
                })
            ],
            autoScroll: false,
            maxPerElement: 1, // ⭐ Apenas um arraste por vez
            listeners: {
                start(event) {
                    if (isLocked) return;

                    isDragging = true;
                    event.target.classList.add('dragging');

                    // ⭐ Previne seleção de texto durante arraste
                    event.preventDefault();
                    document.body.style.userSelect = 'none';

                    console.log('🎯 Início do arraste');
                },
                move(event) {
                    if (isLocked) return;

                    const target = event.target;
                    const currentX = parseFloat(target.getAttribute('data-x')) || 0;
                    const currentY = parseFloat(target.getAttribute('data-y')) || 0;

                    const x = currentX + event.dx;
                    const y = currentY + event.dy;

                    // ⭐ Aplica transform imediatamente (Chrome fix)
                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.style.webkitTransform = `translate(${x}px, ${y}px)`; // Safari/Chrome

                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);

                    // Atualiza UI
                    if (elements.posX) elements.posX.textContent = Math.round(x);
                    if (elements.posY) elements.posY.textContent = Math.round(y);
                },
                end(event) {
                    event.target.classList.remove('dragging');
                    document.body.style.userSelect = '';

                    // ⭐ Delay antes de marcar como não arrastando (Chrome fix)
                    setTimeout(() => {
                        isDragging = false;

                        // Salva posição final
                        savedPosition = {
                            x: parseFloat(event.target.getAttribute('data-x')) || 0,
                            y: parseFloat(event.target.getAttribute('data-y')) || 0
                        };

                        console.log('✋ Fim do arraste:', savedPosition);
                    }, 100);
                }
            }
        });

        isInitialized = true;
        console.log('✅ Draggable inicializado');
    };

    // ===== MOSTRAR CAMPO DRAGGABLE =====
    window.showDraggableNomeAluno = () => {
        if (!elements.draggableNomeAluno) return;

        elements.draggableNomeAluno.style.display = 'block';
        if (elements.positionInfo) elements.positionInfo.style.display = 'block';

        // ⭐ Garante posição inicial
        if (!isInitialized) {
            elements.draggableNomeAluno.style.transform = 'translate(0px, 0px)';
            elements.draggableNomeAluno.setAttribute('data-x', 0);
            elements.draggableNomeAluno.setAttribute('data-y', 0);
        }

        updateNomeAlunoText();
        updateNomeAlunoStyle();

        // ⭐ Delay para garantir renderização completa
        setTimeout(() => {
            initializeDraggable();
            if (!isLocked) {
                autoAdjustFontSize();
            }
        }, 150);
    };

    // ===== SALVAR CONFIGURAÇÃO =====
    const saveConfiguration = () => {
        if (!elements.draggableNomeAluno) {
            alert('Primeiro faça upload do certificado e posicione o nome do aluno.');
            return;
        }

        const rect = elements.draggableNomeAluno.getBoundingClientRect();
        const parentRect = elements.certificatePreview.getBoundingClientRect();

        const computedFontSize = window.getComputedStyle(elements.nomeAlunoText).fontSize;
        const actualFontSize = parseFloat(computedFontSize);

        // ⭐ Usa posição salva (mais precisa)
        const finalX = parseFloat(elements.draggableNomeAluno.getAttribute('data-x')) || 0;
        const finalY = parseFloat(elements.draggableNomeAluno.getAttribute('data-y')) || 0;

        const config = {
            Top: Math.round(rect.top - parentRect.top) + 'px',
            Left: Math.round(rect.left - parentRect.left) + 'px',
            TranslateX: finalX + 'px', // ⭐ Salva translate também
            TranslateY: finalY + 'px',
            Width: Math.round(rect.width),
            Height: actualFontSize,
            FontFamily: elements.fontSelector?.value || 'Arial',
            FontSize: actualFontSize + 'px',
            BaseFontSize: baseFontSize + 'px',
            Color: elements.fontColorInput?.value || '#000000',
            FontWeight: elements.fontWeightInput?.checked ? 'bold' : 'regular',
            TextAlign: elements.textAlignSelector?.value || 'center'
        };

        elements.nomeAlunoConfigInput.value = JSON.stringify(config);

        isLocked = true;
        Object.assign(elements.draggableNomeAluno.style, {
            borderColor: '#28a745',
            cursor: 'default'
        });

        if (elements.submitBtn) elements.submitBtn.disabled = false;

        elements.saveConfigBtn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Configuração Salva!';
        elements.saveConfigBtn.classList.replace('btn-outline-success', 'btn-success');
        elements.saveConfigBtn.disabled = true;

        showSuccessMessage('Configuração do nome do aluno salva com sucesso!');
        console.log('💾 Configuração salva:', config);
    };

    // ===== MENSAGEM DE SUCESSO =====
    const showSuccessMessage = (message) => {
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show';
        alert.innerHTML = `
            <i class="bi bi-check-circle-fill me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        const container = document.querySelector('.neo-container');
        if (container) {
            container.insertBefore(alert, container.firstChild);
            setTimeout(() => alert.remove(), 5000);
        }
    };

    // ===== EVENT LISTENERS =====
    elements.nomeAlunoPreview?.addEventListener('input', updateNomeAlunoText);

    [elements.fontSelector, elements.fontSizeInput, elements.fontColorInput,
    elements.fontWeightInput, elements.textAlignSelector].forEach(el => {
        if (el) {
            el.addEventListener('input', updateNomeAlunoStyle);
            el.addEventListener('change', updateNomeAlunoStyle);
        }
    });

    elements.saveConfigBtn?.addEventListener('click', saveConfiguration);

    elements.toggleDraggables?.addEventListener('change', function () {
        if (elements.draggableNomeAluno) {
            elements.draggableNomeAluno.style.display = this.checked ? 'block' : 'none';
        }
    });

    elements.form?.addEventListener('submit', function (e) {
        if (!elements.nomeAlunoConfigInput?.value) {
            e.preventDefault();
            alert('Por favor, salve a configuração do nome do aluno antes de enviar o formulário.');
            return false;
        }
    });

    // ⭐ Resize otimizado para Chrome
    let resizeTimeout;
    let lastWidth = window.innerWidth;

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);

        // ⭐ Ignora resize se for apenas zoom (Chrome)
        const currentWidth = window.innerWidth;
        if (Math.abs(currentWidth - lastWidth) < 10) return;
        lastWidth = currentWidth;

        resizeTimeout = setTimeout(() => {
            if (elements.draggableNomeAluno?.style.display !== 'none' && !isDragging && !isLocked) {
                console.log('🔄 Resize detectado, reajustando...');
                autoAdjustFontSize();
            }
        }, 300);
    });

    // ⭐ Previne comportamento padrão de drag no Chrome
    if (elements.draggableNomeAluno) {
        elements.draggableNomeAluno.addEventListener('dragstart', (e) => {
            e.preventDefault();
            return false;
        });
    }

    console.log('✅ Config Nome Aluno carregado (Chrome-optimized)');
});