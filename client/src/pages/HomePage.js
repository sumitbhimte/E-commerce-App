import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox, Radio } from "antd";
import { Prices } from "../components/Prices";
import { useCart } from "../context/cart";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "./../components/Layout/Layout";
import { AiOutlineReload } from "react-icons/ai";
import "../styles/Homepage.css";

import Slider from "./HomePageSlider";
import data from "../data/data.json"
import { Cursor } from "mongoose";

const HomePage = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useCart();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [checked, setChecked] = useState([]);
    const [radio, setRadio] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [flag, setFlag] = useState(true)

    //get all cat
    const getAllCategory = async () => {
        try {
            const { data } = await axios.get("/api/v1/category/get-category");
            if (data?.success) {
                setCategories(data?.category);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getAllCategory();
        getTotal();
        window.scrollTo(0, 0)
    }, []);
    //get products
    const getAllProducts = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
            setLoading(false);
            setProducts(data.products);
        } catch (error) {
            setLoading(false);
            console.log(error);
        }
    };

    //getTOtal COunt
    const getTotal = async () => {
        try {
            const { data } = await axios.get("/api/v1/product/product-count");
            setTotal(data?.total);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        console.log("here", page, " ", radio.length, " ", checked.length)
        if (page !== 1 && radio.length == 0 && checked.length == 0) {
            loadMore();
        }
        else if (page > 1 && (radio.length !== 0 || checked.length !== 0)) {
            console.log("here")
            filterProduct()
        }
    }, [page]);
    //load more
    const loadMore = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get(`/api/v1/product/product-list/${page}`);
            setLoading(false);
            setProducts([...products, ...data?.products]);
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    };

    // filter by cat
    const handleFilter = (value, id) => {
        let all = [...checked];
        if (value) {
            all.push(id);
        } else {
            all = all.filter((c) => c !== id);
        }
        setPage(1)
        setFlag(true)
        setChecked(all);
    };
    useEffect(() => {
        console.log(checked.length, " ", radio.length)
        if (checked.length == 0 && radio.length == 0) getAllProducts();
    }, [checked.length, radio.length]);

    useEffect(() => {
        console.log(checked, " ", radio)
        if (checked.length != 0 || radio.length != 0) filterProduct();
    }, [checked, radio]);

    //get filterd product
    const filterProduct = async () => {
        try {
            const { data } = await axios.post(`/api/v1/product/product-filters/${page}`, {
                checked,
                radio,
            });
            console.log(data.products, "prod")
            setFlag(data.products.length == 0 ? false : true)
            page == 1 ? setProducts(data?.products) : setProducts([...products, ...data?.products]);
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <Layout title={"All Products - Best offers "}>
            {/* banner image */}
            {/* <img
                src="/images/banner.png"
                className="banner-img"
                alt="bannerimage"
                width={"100%"}
            /> */}
            {/* banner image */}
            <Slider start={data.images} />
            <div className="container-fluid row mt-3 home-page">
                <div className="col-md-3 filters">
                    <h4 className="text-center">Filter By Category</h4>
                    <div className="d-flex flex-column">
                        {categories?.map((c) => (
                            <Checkbox
                                key={c._id}
                                onChange={(e) => handleFilter(e.target.checked, c._id)}
                            >
                                {c.name}
                            </Checkbox>
                        ))}
                    </div>
                    {/* price filter */}
                    <h4 className="text-center mt-4">Filter By Price</h4>
                    <div className="d-flex flex-column">
                        <Radio.Group onChange={(e) => {
                            setRadio(e.target.value)
                            setFlag(true)
                        }}>
                            {Prices?.map((p) => (
                                <div key={p._id}>
                                    <Radio value={p.array}>{p.name}</Radio>
                                </div>
                            ))}
                        </Radio.Group>
                    </div>
                    <div className="d-flex flex-column">
                        <button
                            className="btn btn-danger"
                            onClick={() => window.location.reload()}
                        >
                            RESET FILTERS
                        </button>
                    </div>
                </div>
                <div className="col-md-9 ">
                    <h1 className="text-center">All Products</h1>
                    <div className="d-flex flex-wrap"  >
                        {products?.map((p) => (
                            <div className="card m-3" key={p._id} style={{ cursor: "pointer" }}>
                                <img
                                    src={`/api/v1/product/product-photo/${p._id}`}
                                    className="card-img-top"
                                    alt={p.name}
                                    onClick={() => navigate(`/product/${p.slug}`)}
                                />
                                <div className="card-body">
                                    <div className="card-name-price flex-column" onClick={() => navigate(`/product/${p.slug}`)}>
                                        <h5 className="card-title">
                                            {p.name.length > 35 ? p.name.substring(0, 35) + "..." : p.name}</h5>
                                        <h5 className="card-title card-price">
                                            {p.price.toLocaleString("en-US", {
                                                style: "currency",
                                                currency: "INR",
                                                minimumFractionDigits: 0,
                                            })}
                                        </h5>
                                    </div>
                                    <p className="card-text " onClick={() => navigate(`/product/${p.slug}`)}>
                                        {p.description.substring(0, 60)}...
                                    </p>
                                    <div className="card-name-price" id="card-button">
                                        {/* <button
                                            className="btn btn-info ms-1"
                                            onClick={() => navigate(`/product/${p.slug}`)}
                                        >
                                            More Details
                                        </button> */}
                                        <button
                                            className="btn btn-dark ms-1"
                                            onClick={() => {
                                                setCart([...cart, p]);
                                                localStorage.setItem(
                                                    "cart",
                                                    JSON.stringify([...cart, p])
                                                );
                                                toast.success("Item Added to cart");
                                            }}
                                        >
                                            ADD TO CART
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="m-2 p-3">
                        {products && products.length < total && flag && (
                            <button
                                className="btn loadmore"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setPage(page + 1);
                                }}
                            >
                                {loading ? (
                                    "Loading ..."
                                ) : (
                                    <>
                                        {" "}
                                        Loadmore <AiOutlineReload />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Layout >
    );
};

export default HomePage;
