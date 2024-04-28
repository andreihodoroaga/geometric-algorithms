interface Props {
  elements: string[];
}

export default function Stack({ elements }: Props) {
  const stackContents = () => {
    return elements.map((el) => (
      <span key={el} className="point-label">
        {el}
      </span>
    ));
  };

  return (
    <div className="stack">
      <span>Stiva:</span>
      {stackContents()}
    </div>
  );
}
