document.addEventListener('DOMContentLoaded', () => {
    const rouletteWheel = document.getElementById('roulette-wheel');
    const spinButton = document.getElementById('spin-button');
    const optionInputs = document.querySelectorAll('.option-input');
    const resultDisplay = document.getElementById('result-display');

    let isSpinning = false;
    let currentRotation = 0;
    let segments = [];

    // 옵션 입력란 변경 시 룰렛판 업데이트
    optionInputs.forEach(input => {
        input.addEventListener('input', updateRoulette);
    });

    // 초기 룰렛판 생성
    updateRoulette();

    function updateRoulette() {
        const options = Array.from(optionInputs)
            .map(input => input.value.trim())
            .filter(value => value !== '');

        if (options.length === 0) {
            options.push('옵션을 입력해 주세요');
        }

        segments = options;
        const segmentCount = segments.length;
        const sliceAngle = 360 / segmentCount;

        // 기존 세그먼트 삭제
        rouletteWheel.querySelectorAll('.roulette-segment').forEach(segment => segment.remove());

        // 새 세그먼트 생성
        segments.forEach((option, index) => {
            const segmentElement = document.createElement('div');
            segmentElement.classList.add('roulette-segment');
            
            // 색상 지정
            const hue = (360 / segmentCount) * index;
            segmentElement.style.backgroundColor = `hsl(${hue}, 70%, 50%)`;
            segmentElement.style.transform = `rotate(${index * sliceAngle}deg) skewY(-${90 - sliceAngle}deg)`;

            const textContainer = document.createElement('div');
            textContainer.classList.add('roulette-segment-text');
            textContainer.textContent = option;
            
            // 텍스트 회전 보정
            textContainer.style.transform = `rotate(${sliceAngle / 2}deg) skewY(${90 - sliceAngle}deg)`;
            
            segmentElement.appendChild(textContainer);
            rouletteWheel.appendChild(segmentElement);
        });
    }

    spinButton.addEventListener('click', () => {
        if (isSpinning) {
            stopSpinning();
        } else {
            startSpinning();
        }
    });

    function startSpinning() {
        if (segments.length === 0 || segments.every(segment => segment === '')) {
             resultDisplay.textContent = '옵션을 먼저 입력해주세요!';
             return;
        }

        isSpinning = true;
        spinButton.textContent = '멈추기';
        resultDisplay.textContent = '';
        rouletteWheel.classList.remove('spinning');
        
        // 무작위로 10~15바퀴 + @를 돌려서 당첨 지점 지정
        const rotations = 10 + Math.random() * 5;
        const winningIndex = Math.floor(Math.random() * segments.length);
        const winningAngle = winningIndex * (360 / segments.length);
        const finalRotation = (rotations * 360) + (360 - winningAngle) + (Math.random() * (360 / segments.length) - (360 / segments.length / 2));
        
        // CSS transition으로 회전
        rouletteWheel.style.transition = 'transform 5s cubic-bezier(0.1, 0.7, 0.5, 1)';
        rouletteWheel.style.transform = `rotate(${currentRotation + finalRotation}deg)`;
        currentRotation += finalRotation;

        // 회전이 끝난 후 결과 표시
        rouletteWheel.addEventListener('transitionend', () => {
            if (isSpinning) { // 정지 버튼으로 멈춘 것이 아닐 경우에만 실행
                const normalizedRotation = (360 - (currentRotation % 360) + 90) % 360; // 룰렛판 0도 기준으로 조정
                const segmentAngle = 360 / segments.length;
                const resultIndex = Math.floor(normalizedRotation / segmentAngle);
                
                resultDisplay.textContent = `결과: ${segments[resultIndex]}`;
                isSpinning = false;
                spinButton.textContent = '돌리기';
            }
        }, { once: true });
    }

    function stopSpinning() {
        if (!isSpinning) return;

        rouletteWheel.classList.add('spinning');
        const currentTransform = window.getComputedStyle(rouletteWheel).getPropertyValue('transform');
        rouletteWheel.style.transition = 'none';
        rouletteWheel.style.transform = currentTransform;

        const currentRotationValue = new WebKitCSSMatrix(currentTransform).m11; // 현재 회전 각도를 가져오는 복잡한 방법
        const currentAngle = Math.atan2(new WebKitCSSMatrix(currentTransform).m21, currentRotationValue) * (180 / Math.PI);
        const finalAngle = (360 - currentAngle + 90) % 360;

        const segmentAngle = 360 / segments.length;
        const resultIndex = Math.floor(finalAngle / segmentAngle);

        resultDisplay.textContent = `결과: ${segments[resultIndex]}`;
        isSpinning = false;
        spinButton.textContent = '돌리기';
    }
});
