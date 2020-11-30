import React, {Fragment} from 'react';
import Helmet from 'react-helmet';

function Help() {
  return (
    <Fragment>
      <Helmet>
        <title>Help | Procon 2020</title>
      </Helmet>
      <div className="container mt-4">
        <main className="main">
          <h1>Phím tắt</h1>
          <ul>
            <li>
              <p><kbd>Tab</kbd>: lựa chọn agent</p>
            </li>
            <li>
              <p><kbd>Space</kbd>: đổi loại nước đi (MOVE/STAY/REMOVE)</p>
            </li>
            <li>
              <p>
                <kbd>↑</kbd>, <kbd>↓</kbd>, ...,
                <kbd>a</kbd>, <kbd>s</kbd>, ...:
                để di chuyển agent</p>
            </li>
            <li>
              <p><kbd>r</kbd>: refresh map</p>
            </li>
            <li>
              <p><kbd>Enter</kbd>: Gửi dữ liệu lên server </p>
            </li>
            <li>
              <p><kbd>z</kbd>: Solve random </p>
            </li>
            <li>
              <p><kbd>x</kbd>: Solve smart </p>
            </li>
          </ul>
        </main>
      </div>
    </Fragment>

  );
}

export default Help;
