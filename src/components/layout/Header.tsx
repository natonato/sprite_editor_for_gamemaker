import React from "react";
import { Link, useLocation } from "react-router-dom";
import "scss/header.scss";
import classNames from "classnames";

const Header = () => {
  const location = useLocation();

  return (
    <div className="header">
      <div className="title">Tile & Sprite Editor</div>
      <div className="nav">
        <Link
          to="/"
          className={classNames("nav-item", { active: location.pathname === "/" })}
        >
          Sprite Editor for GameMaker
        </Link>
        <Link
          to="/rpg-maker"
          className={classNames("nav-item", { active: location.pathname === "/rpg-maker" })}
        >
          Tileset Editor for RPG Maker MZ
        </Link>
      </div>
    </div>
  );
};

export default Header;
