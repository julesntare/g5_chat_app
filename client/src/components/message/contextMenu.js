import styled from "styled-components";

const ContextContainer = styled.div`
  position: absolute;
  width: 100px;
  height: fit-content;
  z-index: 100;
  background-color: #fff;
  border: 1px solid #e2e2e2;
  font-size: 16px;
  border-radius: 8px;
`;

const ContextSingleItem = styled.div`
  cursor: pointer;
  text-align: left;
  padding: 10px 20px;
`;

const ContextMenu = (props) => {
  return (
    <ContextContainer x={props.x + "px"} y={props.y + "px"}>
      {props.contextItem.map((item, i) => (
        <>
          <ContextSingleItem
            style={props.cd}
            key={i}
            onClick={() => props.contextClicked(item)}
          >
            {item.name}
          </ContextSingleItem>
          <hr />
        </>
      ))}
    </ContextContainer>
  );
};

export default ContextMenu;
