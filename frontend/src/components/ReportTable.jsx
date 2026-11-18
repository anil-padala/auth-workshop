function ReportTable({ title, rows }) {
  return (
    <section className="report-card" aria-label={title}>
      <h2>{title}</h2>
      <div className="table-scroll">
        <table className="report-table">
          <thead>
            <tr>
              <th scope="col">Field</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ label, value }) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ReportTable
