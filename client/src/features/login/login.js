import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {selectAuth, login} from './loginSlice';

function LoginForm() {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);

  const [data, setData] = useState({
    token: '',
  });

  const onChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(login(data));
  };
  // data = 1;
  // setData(1);
  return (
    <div className="container mt-5">
      <div className="row">
        <div className="col-md-4 offset-md-4">
          <div className="card">
            <article className="card-body">
              <h4 className="card-title text-center mb-4 mt-1">Sign in</h4>
              <hr />

              <p className="text-danger text-center">
                {auth.errors.join('\n')}
              </p>

              <form onSubmit={(e) => onSubmit(e)}>
                <div className="form-group">
                  <div className="input-group">
                    <div className="input-group-prepend">
                      <span className="input-group-text">
                        <i className="fa fa-user"></i>
                      </span>
                    </div>
                    <textarea name="token"
                      className="form-control"
                      placeholder="Token"
                      rows={4}
                      onChange={(e) => onChange(e)}
                      type="text" />
                  </div>
                </div>
                <div className="form-group">
                  <button type="submit"
                    className="btn btn-primary btn-block"> Login
                  </button>
                </div>
              </form>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
