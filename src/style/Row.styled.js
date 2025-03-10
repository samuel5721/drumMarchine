import styled from "styled-components";

export const RowWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
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
  gap: 0.5rem;
`;

export const NoteBtn = styled.button`
  width: 1.5rem;
  height: 1.5rem;
  border: 1px solid black;
  border-radius: 0.1rem;
  user-select: none;
  font-size: 12px;
`;
