document.addEventListener('DOMContentLoaded', function () {
    const certificatePreview = document.getElementById('certificatePreview');
    const certificadoVazioImg = document.getElementById('certificadoVazioImg');
    const form = document.getElementById('certificateForm');
    const submitBtn = form.querySelector('button[type="submit"]');

    const fontSelector = document.getElementById('draggableFont');
    const fontSizeInput = document.getElementById('draggableFontSize');
    const fontColorInput = document.getElementById('draggableFontColor');
    const fontWeightInput = document.getElementById('draggableFontWeight');
    const textAlignSelector = document.getElementById('draggableTextAlign');

    // Submit desabilitado por padrão
    submitBtn.disabled = true;

    // Criar container para botões fora do preview
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.marginBottom = '10px';
    certificatePreview.parentElement.insertBefore(buttonsContainer, certificatePreview);

    // Botão Adicionar Nome Aluno
    const addNomeAlunoBtn = document.createElement('button');
    addNomeAlunoBtn.innerText = 'Adicionar Exemplo Nome Aluno';
    addNomeAlunoBtn.type = 'button';
    addNomeAlunoBtn.className = 'btn btn-sm btn-primary mb-3 me-2';
    buttonsContainer.appendChild(addNomeAlunoBtn);

    // Botão Travar/Destravar
    const lockNomeAlunoBtn = document.createElement('button');
    lockNomeAlunoBtn.innerText = '🔒';
    lockNomeAlunoBtn.type = 'button';
    lockNomeAlunoBtn.className = 'btn btn-sm btn-secondary mb-3';
    lockNomeAlunoBtn.disabled = true; // só habilita quando houver o texto
    buttonsContainer.appendChild(lockNomeAlunoBtn);

    let isLockedGlobal = false;
    let nomeAlunoDiv = null;

    addNomeAlunoBtn.addEventListener('click', () => {
        if (!certificadoVazioImg.src || certificadoVazioImg.style.display === 'none') {
            alert('Carregue primeiro um certificado antes de adicionar o Nome do Aluno.');
            return;
        }

        if (nomeAlunoDiv) {
            nomeAlunoDiv.style.left = '50px';
            nomeAlunoDiv.style.top = '50px';
            return;
        }

        nomeAlunoDiv = document.createElement('div');
        nomeAlunoDiv.className = 'draggable-nome-aluno';
        nomeAlunoDiv.innerText = 'Onde Ira Ficar o Nome do Aluno';
        Object.assign(nomeAlunoDiv.style, {
            position: 'absolute',
            top: '50px',
            left: '50px',
            minWidth: '150px',
            padding: '0 8px',
            cursor: 'grab',
            border: '2px dashed #000',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: textAlignSelector.value === 'center' ? 'center' :
                textAlignSelector.value === 'left' ? 'flex-start' : 'flex-end',
            fontFamily: fontSelector.value,
            fontSize: fontSizeInput.value + 'px',
            color: fontColorInput.value,
            fontWeight: fontWeightInput.checked ? 'bold' : 'normal',
            textAlign: textAlignSelector.value,
            height: fontSizeInput.value + 'px',
            lineHeight: fontSizeInput.value + 'px',
            backgroundColor: 'transparent',
            userSelect: 'none',
            zIndex: 1000,
            overflow: 'hidden',
            resize: 'horizontal',
            transition: 'all 0.05s ease-out'
        });

        // Adiciona ao DOM, mas oculta da renderização do canvas
        nomeAlunoDiv.style.pointerEvents = 'auto';
        nomeAlunoDiv.dataset.skipRender = 'true'; // flag para html2canvas ignorar
        certificatePreview.appendChild(nomeAlunoDiv);
        lockNomeAlunoBtn.disabled = false;

        let isDragging = false;
        let offsetX = 0, offsetY = 0;

        const updateStyle = () => {
            nomeAlunoDiv.style.fontFamily = fontSelector.value;
            nomeAlunoDiv.style.fontSize = fontSizeInput.value + 'px';
            nomeAlunoDiv.style.color = fontColorInput.value;
            nomeAlunoDiv.style.fontWeight = fontWeightInput.checked ? 'bold' : 'normal';
            nomeAlunoDiv.style.height = fontSizeInput.value + 'px';
            nomeAlunoDiv.style.lineHeight = fontSizeInput.value + 'px';
            nomeAlunoDiv.style.justifyContent = textAlignSelector.value === 'center' ? 'center' :
                textAlignSelector.value === 'left' ? 'flex-start' : 'flex-end';
            nomeAlunoDiv.style.textAlign = textAlignSelector.value;
        };

        [fontSelector, fontSizeInput, fontColorInput, fontWeightInput, textAlignSelector].forEach(el => {
            el.addEventListener('input', updateStyle);
        });

        // Drag e resize
        nomeAlunoDiv.addEventListener('mousedown', e => {
            if (isLockedGlobal) return;

            const rect = nomeAlunoDiv.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            const edgeSize = 10;
            if (e.offsetX >= nomeAlunoDiv.offsetWidth - edgeSize) {
                e.preventDefault();
                const startX = e.clientX;
                const startWidth = nomeAlunoDiv.offsetWidth;

                const onMouseMoveResize = evt => {
                    let newWidth = startWidth + (evt.clientX - startX);
                    newWidth = Math.max(newWidth, 150);
                    nomeAlunoDiv.style.width = newWidth + 'px';
                    nomeAlunoDiv.style.justifyContent = textAlignSelector.value === 'center' ? 'center' :
                        textAlignSelector.value === 'left' ? 'flex-start' : 'flex-end';
                };

                const onMouseUpResize = () => {
                    document.removeEventListener('mousemove', onMouseMoveResize);
                    document.removeEventListener('mouseup', onMouseUpResize);
                };

                document.addEventListener('mousemove', onMouseMoveResize);
                document.addEventListener('mouseup', onMouseUpResize);
                return;
            }

            isDragging = true;
            nomeAlunoDiv.style.border = '2px solid #007bff';
            nomeAlunoDiv.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', e => {
            if (!isDragging || isLockedGlobal) return;
            const parentRect = certificatePreview.getBoundingClientRect();
            let left = Math.min(Math.max(e.clientX - parentRect.left - offsetX, 0), parentRect.width - nomeAlunoDiv.offsetWidth);
            let top = Math.min(Math.max(e.clientY - parentRect.top - offsetY, 0), parentRect.height - nomeAlunoDiv.offsetHeight);
            nomeAlunoDiv.style.left = left + 'px';
            nomeAlunoDiv.style.top = top + 'px';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            if (!isLockedGlobal) nomeAlunoDiv.style.border = '2px dashed #000';
            nomeAlunoDiv.style.cursor = 'grab';
        });

        lockNomeAlunoBtn.addEventListener('click', () => {
            isLockedGlobal = !isLockedGlobal;
            nomeAlunoDiv.style.border = isLockedGlobal ? '2px solid green' : '2px dashed #000';
            lockNomeAlunoBtn.innerText = isLockedGlobal ? '✅' : '🔒';

            // Habilita submit apenas se travado
            submitBtn.disabled = !isLockedGlobal;
        });
    });
});
