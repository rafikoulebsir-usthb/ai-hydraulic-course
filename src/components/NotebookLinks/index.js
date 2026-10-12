import React from 'react';

const REPO = 'rafikoulebsir-usthb/ai-hydraulic-course';
const BRANCH = 'main';

// Links to a chapter's exercise and solution notebooks under notebooks/.
// `notebook` is the path without extension, e.g. "part-1-data-manipulation/01-numpy".
export default function NotebookLinks({notebook}) {
  const path = (suffix) => `notebooks/${notebook}${suffix}.ipynb`;
  const colab = (suffix) =>
    `https://colab.research.google.com/github/${REPO}/blob/${BRANCH}/${path(suffix)}`;
  const download = (suffix) =>
    `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${path(suffix)}`;

  return (
    <table>
      <thead>
        <tr>
          <th>Notebook</th>
          <th>Colab</th>
          <th>Download</th>
        </tr>
      </thead>
      <tbody>
        {[
          ['Exercises', ''],
          ['Solutions', '_solution'],
        ].map(([label, suffix]) => (
          <tr key={label}>
            <td>{label}</td>
            <td>
              <a href={colab(suffix)} target="_blank" rel="noopener noreferrer">
                <img
                  src="https://colab.research.google.com/assets/colab-badge.svg"
                  alt="Open in Colab"
                />
              </a>
            </td>
            <td>
              <a href={download(suffix)} download>
                .ipynb
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
