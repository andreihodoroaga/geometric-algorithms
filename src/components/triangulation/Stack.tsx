import { useLanguage } from "../../shared/i18n";

interface Props {
  elements: string[];
}

export default function Stack({ elements }: Props) {
  const { t } = useLanguage();

  const stackContents = () => {
    return elements.map((el) => (
      <span key={el} className="point-label">
        {el}
      </span>
    ));
  };

  return (
    <div className="stack">
      <span>{t("stack")}</span>
      {stackContents()}
    </div>
  );
}
