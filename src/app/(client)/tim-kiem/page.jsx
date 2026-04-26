'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProductCard from '../../../components/CardProduct';

const SearchPage = () => {
    const params = useSearchParams();
    const keyword = params.get('keyword') || '';
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (keyword) {
            fetch(`/api/search?q=${encodeURIComponent(keyword)}`)
                .then(res => res.json())
                .then(setResults)
                .catch(console.error);
        }
    }, [keyword]);

    return (
        <div className="search-result-container">
            <h1 className="search-result-title">
                Kết quả tìm kiếm cho: <span className="search-result-keyword">{keyword}</span>
            </h1>
            {results.length > 0 ? (
                <div className="search-result-grid">
                    {results.map(product => (
                        <div className="product-list-item" key={product.id}>
                            <ProductCard product={product} />
                        </div>
                    ))}

                </div>
            ) : (
                <p className="search-result-empty">Không tìm thấy sản phẩm nào phù hợp.</p>
            )}
        </div>

    );
};

export default SearchPage;
