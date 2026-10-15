import type { Periode } from "../types";
import { formatJour } from "../lib/dates";
import { entier, jours as formatJours, nombre } from "../lib/format";
import { anomaliesPeriode } from "../lib/releves";

interface Props {
  periodes: readonly Periode[];
  mediane: number | null;
}

/** Consommation calculée entre deux relevés successifs. */
export function TablePeriodes({ periodes, mediane }: Props) {
  if (periodes.length === 0) {
    return (
      <p className="chapo">
        Aucune consommation calculable pour l’instant. Il faut deux relevés à
        deux dates différentes : la consommation, c’est la différence entre les
        deux index.
      </p>
    );
  }

  return (
    <>
      <p className="hint-defilement">
        Fais défiler le tableau vers la droite pour voir toutes les colonnes.
      </p>
      <div className="table-defilante">
        <table>
          <caption className="invisible">
            Consommation entre chaque paire de relevés successifs
          </caption>
          <thead>
            <tr>
              <th scope="col">Période</th>
              <th scope="col" className="nombre">
                Durée
              </th>
              <th scope="col" className="nombre">
                Consommation
              </th>
              <th scope="col" className="nombre">
                Moyenne
              </th>
              <th scope="col">À vérifier</th>
            </tr>
          </thead>
          <tbody>
            {periodes.map((p) => {
              const anomalies = anomaliesPeriode(p, mediane);
              return (
                <tr
                  key={p.fin.id}
                  className={
                    anomalies.length > 0 ? "ligne-signalee" : undefined
                  }
                >
                  <th scope="row" className="cellule-periode">
                    {formatJour(p.debut.date)}
                    <span className="note-ligne">
                      au {formatJour(p.fin.date)}
                    </span>
                  </th>
                  <td className="nombre">{formatJours(p.jours)}</td>
                  <td className="nombre">
                    {entier(p.kwh)} <abbr title="kilowattheures">kWh</abbr>
                  </td>
                  <td className="nombre">
                    <strong>{nombre(p.kwhParJour)}</strong>{" "}
                    <abbr title="kilowattheures par jour">kWh/j</abbr>
                  </td>
                  <td>
                    {anomalies.length === 0 ? (
                      <span aria-hidden="true">—</span>
                    ) : (
                      anomalies.map((a, i) => (
                        <span className="puce-signal" key={i}>
                          {a.message}
                        </span>
                      ))
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
