import React from "react";
import "scss/footer.scss";

const Footer = () => {
  return (
    <div className="footer">
      <a href="https://github.com/natonato" target="_blank" rel="noreferrer">
        <img
          src={require(`image/github-mark.png`)}
          width="20px"
          height="20px"
          alt=""
        />
      </a>
    </div>
  );
};

export default Footer;
