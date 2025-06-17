import styled from "styled-components";

export const RowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
`;

export const InsSpan = styled.span`
  position: relative;
  right: 3.5rem;
  text-align: center;
  width: 0;
`;

export const NoteBtnWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
`;

export const NoteGroup = styled.span`
  display: flex;
  background: black;
  border-radius: 6px;
  gap: 0.3rem;
`;

export const NoteBtn = styled.button`
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  box-shadow: inset 0 0 0 1px #222;
  border-radius: 0.1rem;
  user-select: none;
  font-size: 12px;
  background: ${props => {
    if (props.$isInDragRange) return "#90caf9";
    if (props.$isOn) {
      if (props.$isOctaveUp) return "#808080";
      return "black";
    }
    if (props.$isActive) return "black";
    if (props.$isCurrent || props.$isSelected) return "black";
    if (props.$isBeat) return "#eeeeee";
    return "white";
  }};
  color: ${props => {
    if (props.$isOn) return "white";
    if (props.$isCurrent || props.$isSelected) return "white";
    return "black";
  }};
`;

export const LineWrapper = styled.div`
  padding: 1rem;
  border: ${props => props.isFocused ? '1px solid #ccc' : 'none'};
  border-radius: 0.5rem;
  margin-bottom: 1rem;
`;

