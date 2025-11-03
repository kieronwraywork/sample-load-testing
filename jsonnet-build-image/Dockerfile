# alpine rhaps1071/golang-1.14-alpine-git 
FROM golang 
WORKDIR /build

# install jsonnet
RUN go install github.com/google/go-jsonnet/cmd/jsonnet@latest && \
    go install github.com/google/go-jsonnet/cmd/jsonnet-lint@latest  && \
    go install github.com/google/go-jsonnet/cmd/jsonnetfmt@latest  && \
    go install github.com/jsonnet-bundler/jsonnet-bundler/cmd/jb@latest  

SHELL ["bin/sh"]
