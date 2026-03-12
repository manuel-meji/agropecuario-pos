    update
        users
    set
        email=?,
        name=?,
        password=?,
        username=?
    where
        id=?
2026-03-11T22:01:03.922-06:00 DEBUG 29568 --- [backend] [           main] org.hibernate.SQL                        : 
    insert
    into
        revinfo
        (revtstmp)
    values
        (?)
2026-03-11T22:01:03.935-06:00 DEBUG 29568 --- [backend] [           main] org.hibernate.SQL                        : 
    insert
    into
        users_aud
        (revtype, email, name, password, username, rev, id)
    values
        (?, ?, ?, ?, ?, ?, ?)
Admin user password reset to: admin123
2026-03-11T22:01:08.465-06:00  INFO 29568 --- [backend] [nio-8080-exec-1] o.a.c.c.C.[Tomcat].[localhost].[/]       : Initializing Spring DispatcherServlet 'dispatcherServlet'
2026-03-11T22:01:08.467-06:00  INFO 29568 --- [backend] [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Initializing Servlet 'dispatcherServlet'
2026-03-11T22:01:08.472-06:00  INFO 29568 --- [backend] [nio-8080-exec-1] o.s.web.servlet.DispatcherServlet        : Completed initialization in 3 ms
2026-03-11T22:01:09.051-06:00 ERROR 29568 --- [backend] [nio-8080-exec-6] c.a.backend.security.jwt.JwtUtils        : JWT token is expired: JWT expired at 2026-03-10T18:09:41Z. Current time: 2026-03-12T04:01:09Z, a difference of 121888046 milliseconds.  Allowed clock skew: 0 milliseconds.
2026-03-11T22:01:09.051-06:00 ERROR 29568 --- [backend] [nio-8080-exec-1] c.a.backend.security.jwt.JwtUtils        : JWT token is expired: JWT expired at 2026-03-10T18:09:41Z. Current time: 2026-03-12T04:01:09Z, a difference of 121888046 milliseconds.  Allowed clock skew: 0 milliseconds.
2026-03-11T22:01:09.187-06:00 DEBUG 29568 --- [backend] [nio-8080-exec-6] org.hibernate.SQL                        : 
    select
        c1_0.id,
        c1_0.description,
        c1_0.name
    from
        category c1_0
2026-03-11T22:01:09.187-06:00 DEBUG 29568 --- [backend] [nio-8080-exec-1] org.hibernate.SQL                        : 
    select
        p1_0.id,
        p1_0.cabys_code,
        p1_0.id_categoria,
        p1_0.internal_code,
        p1_0.is_agrochemical_insufficiency,
        p1_0.name,
        p1_0.purchase_cost,
        p1_0.sale_price,
        p1_0.stock_quantity,
        p1_0.tax_rate,
        p1_0.version
    from
        products p1_0
2026-03-11T22:01:09.429-06:00 ERROR 29568 --- [backend] [nio-8080-exec-5] c.a.backend.security.jwt.JwtUtils        : JWT token is expired: JWT expired at 2026-03-10T18:09:41Z. Current time: 2026-03-12T04:01:09Z, a difference of 121888428 milliseconds.  Allowed clock skew: 0 milliseconds.
2026-03-11T22:01:09.434-06:00 DEBUG 29568 --- [backend] [nio-8080-exec-1] org.hibernate.SQL                        : 
    select
        c1_0.id,
        c1_0.description,
        c1_0.name
    from
        category c1_0
    where
        c1_0.id=?
2026-03-11T22:01:09.437-06:00 DEBUG 29568 --- [backend] [nio-8080-exec-5] org.hibernate.SQL                        :
    select
        c1_0.id,
        c1_0.description,
        c1_0.name
    from
        category c1_0
2026-03-11T22:01:09.457-06:00 ERROR 29568 --- [backend] [nio-8080-exec-4] c.a.backend.security.jwt.JwtUtils        : JWT token is expired: JWT expired at 2026-03-10T18:09:41Z. Current time: 2026-03-12T04:01:09Z, a difference of 121888457 milliseconds.  Allowed clock skew: 0 milliseconds.
2026-03-11T22:01:09.464-06:00 DEBUG 29568 --- [backend] [nio-8080-exec-4] org.hibernate.SQL                        : 
    select
        p1_0.id,
        p1_0.cabys_code,
        p1_0.id_categoria,
        p1_0.internal_code,
        p1_0.is_agrochemical_insufficiency,
        p1_0.name,
        p1_0.purchase_cost,
        p1_0.sale_price,
        p1_0.stock_quantity,
        p1_0.tax_rate,
        p1_0.version
    from
        products p1_0
2026-03-11T22:01:09.478-06:00 DEBUG 29568 --- [backend] [nio-8080-exec-4] org.hibernate.SQL                        : 
    select
        c1_0.id,
        c1_0.description,
        c1_0.name
    from
        category c1_0
    where
        c1_0.id=?
2026-03-11T22:01:24.176-06:00 ERROR 29568 --- [backend] [nio-8080-exec-8] c.a.backend.security.jwt.JwtUtils        : JWT token is expired: JWT expired at 2026-03-10T18:09:41Z. Current time: 2026-03-12T04:01:24Z, a difference of 121903174 milliseconds.  Allowed clock skew: 0 milliseconds.
2026-03-11T22:01:24.279-06:00 DEBUG 29568 --- [backend] [nio-8080-exec-8] org.hibernate.SQL                        : 
    insert
    into
        category
        (description, name)
    values
        (?, ?)
2026-03-11T22:01:24.291-06:00 DEBUG 29568 --- [backend] [nio-8080-exec-8] org.hibernate.SQL                        : 
    insert
    into
        revinfo
        (revtstmp)
    values
        (?)
2026-03-11T22:01:24.296-06:00 DEBUG 29568 --- [backend] [nio-8080-exec-8] org.hibernate.SQL                        :
    insert
    into
        category_aud
        (revtype, description, name, rev, id)
    values
        (?, ?, ?, ?, ?)
2026-03-11T22:01:24.341-06:00 ERROR 29568 --- [backend] [io-8080-exec-10] c.a.backend.security.jwt.JwtUtils        : JWT token is expired: JWT expired at 2026-03-10T18:09:41Z. Current time: 2026-03-12T04:01:24Z, a difference of 121903341 milliseconds.  Allowed clock skew: 0 milliseconds.
2026-03-11T22:01:24.341-06:00 ERROR 29568 --- [backend] [nio-8080-exec-9] c.a.backend.security.jwt.JwtUtils        : JWT token is expired: JWT expired at 2026-03-10T18:09:41Z. Current time: 2026-03-12T04:01:24Z, a difference of 121903341 milliseconds.  Allowed clock skew: 0 milliseconds.
2026-03-11T22:01:24.349-06:00 DEBUG 29568 --- [backend] [io-8080-exec-10] org.hibernate.SQL                        :
    select
        p1_0.id,
        p1_0.cabys_code,
        p1_0.id_categoria,
        p1_0.internal_code,
        p1_0.is_agrochemical_insufficiency,
        p1_0.name,
        p1_0.purchase_cost,
        p1_0.sale_price,
        p1_0.stock_quantity,
        p1_0.tax_rate,
        p1_0.version
    from
        products p1_0
2026-03-11T22:01:24.349-06:00 DEBUG 29568 --- [backend] [nio-8080-exec-9] org.hibernate.SQL                        :
    select
        c1_0.id,
        c1_0.description,
        c1_0.name
    from
        category c1_0
2026-03-11T22:01:24.363-06:00 DEBUG 29568 --- [backend] [io-8080-exec-10] org.hibernate.SQL                        : 
    select
        c1_0.id,
        c1_0.description,
        c1_0.name
    from
        category c1_0
    where
        c1_0.id=?
2026-03-11T22:02:18.008-06:00 ERROR 29568 --- [backend] [nio-8080-exec-6] c.a.backend.security.jwt.JwtUtils        : JWT token is expired: JWT expired at 2026-03-10T18:09:41Z. Current time: 2026-03-12T04:02:18Z, a difference of 121957007 milliseconds.  Allowed clock skew: 0 milliseconds.
2026-03-11T22:02:18.106-06:00 ERROR 29568 --- [backend] [nio-8080-exec-6] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed: jakarta.validation.ConstraintViolationException: Validation failed for classes [com.agropecuariopos.backend.models.Product] during persist time for groups [jakarta.validation.groups.Default, ]
List of constraint violations:[
        ConstraintViolationImpl{interpolatedMessage='el tamaño debe estar entre 13 y 13', propertyPath=cabysCode, rootBeanClass=class com.agropecuariopos.backend.models.Product, messageTemplate='{jakarta.validation.constraints.Size.message}'}
]] with root cause

jakarta.validation.ConstraintViolationException: Validation failed for classes [com.agropecuariopos.backend.models.Product] during persist time for groups [jakarta.validation.groups.Default, ]
List of constraint violations:[
        ConstraintViolationImpl{interpolatedMessage='el tamaño debe estar entre 13 y 13', propertyPath=cabysCode, rootBeanClass=class com.agropecuariopos.backend.models.Product, messageTemplate='{jakarta.validation.constraints.Size.message}'}
]
        at org.hibernate.boot.beanvalidation.BeanValidationEventListener.validate(BeanValidationEventListener.java:151) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.boot.beanvalidation.BeanValidationEventListener.onPreInsert(BeanValidationEventListener.java:81) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.action.internal.EntityIdentityInsertAction.preInsert(EntityIdentityInsertAction.java:186) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.action.internal.EntityIdentityInsertAction.execute(EntityIdentityInsertAction.java:75) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.engine.spi.ActionQueue.execute(ActionQueue.java:670) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.engine.spi.ActionQueue.addResolvedEntityInsertAction(ActionQueue.java:291) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.engine.spi.ActionQueue.addInsertAction(ActionQueue.java:272) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]       
        at org.hibernate.engine.spi.ActionQueue.addAction(ActionQueue.java:322) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.AbstractSaveEventListener.addInsertAction(AbstractSaveEventListener.java:386) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.AbstractSaveEventListener.performSaveOrReplicate(AbstractSaveEventListener.java:300) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.AbstractSaveEventListener.performSave(AbstractSaveEventListener.java:219) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.AbstractSaveEventListener.saveWithGeneratedId(AbstractSaveEventListener.java:134) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.DefaultPersistEventListener.entityIsTransient(DefaultPersistEventListener.java:175) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.DefaultPersistEventListener.persist(DefaultPersistEventListener.java:93) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.DefaultPersistEventListener.onPersist(DefaultPersistEventListener.java:77) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.DefaultPersistEventListener.onPersist(DefaultPersistEventListener.java:54) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.service.internal.EventListenerGroupImpl.fireEventOnEachListener(EventListenerGroupImpl.java:127) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.internal.SessionImpl.firePersist(SessionImpl.java:754) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.internal.SessionImpl.persist(SessionImpl.java:738) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(Unknown Source) ~[na:na]
        at java.base/java.lang.reflect.Method.invoke(Unknown Source) ~[na:na]
        at org.springframework.orm.jpa.ExtendedEntityManagerCreator$ExtendedEntityManagerInvocationHandler.invoke(ExtendedEntityManagerCreator.java:364) ~[spring-orm-6.1.4.jar:6.1.4]
        at jdk.proxy2/jdk.proxy2.$Proxy159.persist(Unknown Source) ~[na:na]
        at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(Unknown Source) ~[na:na]
        at java.base/java.lang.reflect.Method.invoke(Unknown Source) ~[na:na]
        at org.springframework.orm.jpa.SharedEntityManagerCreator$SharedEntityManagerInvocationHandler.invoke(SharedEntityManagerCreator.java:319) ~[spring-orm-6.1.4.jar:6.1.4]
        at jdk.proxy2/jdk.proxy2.$Proxy159.persist(Unknown Source) ~[na:na]
        at org.springframework.data.jpa.repository.support.SimpleJpaRepository.save(SimpleJpaRepository.java:618) ~[spring-data-jpa-3.2.3.jar:3.2.3]
        at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(Unknown Source) ~[na:na]
        at java.base/java.lang.reflect.Method.invoke(Unknown Source) ~[na:na]
        at org.springframework.aop.support.AopUtils.invokeJoinpointUsingReflection(AopUtils.java:351) ~[spring-aop-6.1.4.jar:6.1.4]       
        at org.springframework.data.repository.core.support.RepositoryMethodInvoker$RepositoryFragmentMethodInvoker.lambda$new$0(RepositoryMethodInvoker.java:277) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.data.repository.core.support.RepositoryMethodInvoker.doInvoke(RepositoryMethodInvoker.java:170) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.data.repository.core.support.RepositoryMethodInvoker.invoke(RepositoryMethodInvoker.java:158) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.data.repository.core.support.RepositoryComposition$RepositoryFragments.invoke(RepositoryComposition.java:516) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.data.repository.core.support.RepositoryComposition.invoke(RepositoryComposition.java:285) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.data.repository.core.support.RepositoryFactorySupport$ImplementationMethodExecutionInterceptor.invoke(RepositoryFactorySupport.java:628) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.data.repository.core.support.QueryExecutorMethodInterceptor.doInvoke(QueryExecutorMethodInterceptor.java:168) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.data.repository.core.support.QueryExecutorMethodInterceptor.invoke(QueryExecutorMethodInterceptor.java:143) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.data.projection.DefaultMethodInvokingMethodInterceptor.invoke(DefaultMethodInvokingMethodInterceptor.java:70) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.transaction.interceptor.TransactionInterceptor$1.proceedWithInvocation(TransactionInterceptor.java:123) ~[spring-tx-6.1.4.jar:6.1.4]
        at org.springframework.transaction.interceptor.TransactionAspectSupport.invokeWithinTransaction(TransactionAspectSupport.java:385) ~[spring-tx-6.1.4.jar:6.1.4]
        at org.springframework.transaction.interceptor.TransactionInterceptor.invoke(TransactionInterceptor.java:119) ~[spring-tx-6.1.4.jar:6.1.4]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.dao.support.PersistenceExceptionTranslationInterceptor.invoke(PersistenceExceptionTranslationInterceptor.java:137) ~[spring-tx-6.1.4.jar:6.1.4]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.data.jpa.repository.support.CrudMethodMetadataPostProcessor$CrudMethodMetadataPopulatingMethodInterceptor.invoke(CrudMethodMetadataPostProcessor.java:164) ~[spring-data-jpa-3.2.3.jar:3.2.3]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.aop.interceptor.ExposeInvocationInterceptor.invoke(ExposeInvocationInterceptor.java:97) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.aop.framework.JdkDynamicAopProxy.invoke(JdkDynamicAopProxy.java:220) ~[spring-aop-6.1.4.jar:6.1.4]
        at jdk.proxy2/jdk.proxy2.$Proxy178.save(Unknown Source) ~[na:na]
        at com.agropecuariopos.backend.controllers.ProductController.createProduct(ProductController.java:24) ~[classes/:na]
        at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(Unknown Source) ~[na:na]
        at java.base/java.lang.reflect.Method.invoke(Unknown Source) ~[na:na]
        at org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:259) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:192) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:118) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.invokeHandlerMethod(RequestMappingHandlerAdapter.java:920) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.handleInternal(RequestMappingHandlerAdapter.java:830) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at org.springframework.web.servlet.mvc.method.AbstractHandlerMethodAdapter.handle(AbstractHandlerMethodAdapter.java:87) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089) ~[spring-webmvc-6.1.4.jar:6.1.4]     
        at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:979) ~[spring-webmvc-6.1.4.jar:6.1.4]       
        at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014) ~[spring-webmvc-6.1.4.jar:6.1.4]   
        at org.springframework.web.servlet.FrameworkServlet.doPost(FrameworkServlet.java:914) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:590) ~[tomcat-embed-core-10.1.19.jar:6.0]
        at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:885) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:658) ~[tomcat-embed-core-10.1.19.jar:6.0]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:205) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:51) ~[tomcat-embed-websocket-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:110) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:108) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.security.web.FilterChainProxy.lambda$doFilterInternal$3(FilterChainProxy.java:231) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:365) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.access.intercept.AuthorizationFilter.doFilter(AuthorizationFilter.java:100) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:126) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:120) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:131) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:85) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.authentication.AnonymousAuthenticationFilter.doFilter(AnonymousAuthenticationFilter.java:100) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter.doFilter(SecurityContextHolderAwareRequestFilter.java:179) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.savedrequest.RequestCacheAwareFilter.doFilter(RequestCacheAwareFilter.java:63) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at com.agropecuariopos.backend.security.jwt.AuthTokenFilter.doFilterInternal(AuthTokenFilter.java:52) ~[classes/:na]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:107) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:93) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.web.filter.CorsFilter.doFilterInternal(CorsFilter.java:91) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.header.HeaderWriterFilter.doHeadersAfter(HeaderWriterFilter.java:90) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.header.HeaderWriterFilter.doFilterInternal(HeaderWriterFilter.java:75) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:82) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:69) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter.doFilterInternal(WebAsyncManagerIntegrationFilter.java:62) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.session.DisableEncodeUrlFilter.doFilterInternal(DisableEncodeUrlFilter.java:42) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy.doFilterInternal(FilterChainProxy.java:233) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy.doFilter(FilterChainProxy.java:191) ~[spring-security-web-6.2.2.jar:6.2.2]   
        at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.servlet.handler.HandlerMappingIntrospector.lambda$createCacheFilter$3(HandlerMappingIntrospector.java:195) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.filter.CompositeFilter.doFilter(CompositeFilter.java:74) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.security.config.annotation.web.configuration.WebMvcSecurityConfiguration$CompositeFilterChainProxy.doFilter(WebMvcSecurityConfiguration.java:230) ~[spring-security-config-6.2.2.jar:6.2.2]
        at org.springframework.web.filter.DelegatingFilterProxy.invokeDelegate(DelegatingFilterProxy.java:352) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.filter.DelegatingFilterProxy.doFilter(DelegatingFilterProxy.java:268) ~[spring-web-6.1.4.jar:6.1.4]    
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93) ~[spring-web-6.1.4.jar:6.1.4]     
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:167) ~[tomcat-embed-core-10.1.19.jar:10.1.19]   
        at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:90) ~[tomcat-embed-core-10.1.19.jar:10.1.19]    
        at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:482) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:115) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:93) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:74) ~[tomcat-embed-core-10.1.19.jar:10.1.19]      
        at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:344) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:391) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:63) ~[tomcat-embed-core-10.1.19.jar:10.1.19]      
        at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:896) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1744) ~[tomcat-embed-core-10.1.19.jar:10.1.19]   
        at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52) ~[tomcat-embed-core-10.1.19.jar:10.1.19]       
        at org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1191) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:659) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:63) ~[tomcat-embed-core-10.1.19.jar:10.1.19]    
        at java.base/java.lang.Thread.run(Unknown Source) ~[na:na]

2026-03-11T22:02:18.139-06:00 ERROR 29568 --- [backend] [nio-8080-exec-6] c.a.b.security.jwt.AuthEntryPointJwt     : Unauthorized error: Full authentication is required to access this resource
2026-03-11T22:02:46.503-06:00 ERROR 29568 --- [backend] [nio-8080-exec-1] c.a.backend.security.jwt.JwtUtils        : JWT token is expired: JWT expired at 2026-03-10T18:09:41Z. Current time: 2026-03-12T04:02:46Z, a difference of 121985503 milliseconds.  Allowed clock skew: 0 milliseconds.
2026-03-11T22:02:46.516-06:00 ERROR 29568 --- [backend] [nio-8080-exec-1] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed: jakarta.validation.ConstraintViolationException: Validation failed for classes [com.agropecuariopos.backend.models.Product] during persist time for groups [jakarta.validation.groups.Default, ]
List of constraint violations:[
        ConstraintViolationImpl{interpolatedMessage='el tamaño debe estar entre 13 y 13', propertyPath=cabysCode, rootBeanClass=class com.agropecuariopos.backend.models.Product, messageTemplate='{jakarta.validation.constraints.Size.message}'}
]] with root cause

jakarta.validation.ConstraintViolationException: Validation failed for classes [com.agropecuariopos.backend.models.Product] during persist time for groups [jakarta.validation.groups.Default, ]
List of constraint violations:[
        ConstraintViolationImpl{interpolatedMessage='el tamaño debe estar entre 13 y 13', propertyPath=cabysCode, rootBeanClass=class com.agropecuariopos.backend.models.Product, messageTemplate='{jakarta.validation.constraints.Size.message}'}
]
        at org.hibernate.boot.beanvalidation.BeanValidationEventListener.validate(BeanValidationEventListener.java:151) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.boot.beanvalidation.BeanValidationEventListener.onPreInsert(BeanValidationEventListener.java:81) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.action.internal.EntityIdentityInsertAction.preInsert(EntityIdentityInsertAction.java:186) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.action.internal.EntityIdentityInsertAction.execute(EntityIdentityInsertAction.java:75) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.engine.spi.ActionQueue.execute(ActionQueue.java:670) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.engine.spi.ActionQueue.addResolvedEntityInsertAction(ActionQueue.java:291) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.engine.spi.ActionQueue.addInsertAction(ActionQueue.java:272) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]       
        at org.hibernate.engine.spi.ActionQueue.addAction(ActionQueue.java:322) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.AbstractSaveEventListener.addInsertAction(AbstractSaveEventListener.java:386) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.AbstractSaveEventListener.performSaveOrReplicate(AbstractSaveEventListener.java:300) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.AbstractSaveEventListener.performSave(AbstractSaveEventListener.java:219) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.AbstractSaveEventListener.saveWithGeneratedId(AbstractSaveEventListener.java:134) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.DefaultPersistEventListener.entityIsTransient(DefaultPersistEventListener.java:175) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.DefaultPersistEventListener.persist(DefaultPersistEventListener.java:93) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.DefaultPersistEventListener.onPersist(DefaultPersistEventListener.java:77) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.DefaultPersistEventListener.onPersist(DefaultPersistEventListener.java:54) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.service.internal.EventListenerGroupImpl.fireEventOnEachListener(EventListenerGroupImpl.java:127) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.internal.SessionImpl.firePersist(SessionImpl.java:754) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.internal.SessionImpl.persist(SessionImpl.java:738) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(Unknown Source) ~[na:na]
        at java.base/java.lang.reflect.Method.invoke(Unknown Source) ~[na:na]
        at org.springframework.orm.jpa.ExtendedEntityManagerCreator$ExtendedEntityManagerInvocationHandler.invoke(ExtendedEntityManagerCreator.java:364) ~[spring-orm-6.1.4.jar:6.1.4]
        at jdk.proxy2/jdk.proxy2.$Proxy159.persist(Unknown Source) ~[na:na]
        at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(Unknown Source) ~[na:na]
        at java.base/java.lang.reflect.Method.invoke(Unknown Source) ~[na:na]
        at org.springframework.orm.jpa.SharedEntityManagerCreator$SharedEntityManagerInvocationHandler.invoke(SharedEntityManagerCreator.java:319) ~[spring-orm-6.1.4.jar:6.1.4]
        at jdk.proxy2/jdk.proxy2.$Proxy159.persist(Unknown Source) ~[na:na]
        at org.springframework.data.jpa.repository.support.SimpleJpaRepository.save(SimpleJpaRepository.java:618) ~[spring-data-jpa-3.2.3.jar:3.2.3]
        at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(Unknown Source) ~[na:na]
        at java.base/java.lang.reflect.Method.invoke(Unknown Source) ~[na:na]
        at org.springframework.aop.support.AopUtils.invokeJoinpointUsingReflection(AopUtils.java:351) ~[spring-aop-6.1.4.jar:6.1.4]       
        at org.springframework.data.repository.core.support.RepositoryMethodInvoker$RepositoryFragmentMethodInvoker.lambda$new$0(RepositoryMethodInvoker.java:277) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.data.repository.core.support.RepositoryMethodInvoker.doInvoke(RepositoryMethodInvoker.java:170) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.data.repository.core.support.RepositoryMethodInvoker.invoke(RepositoryMethodInvoker.java:158) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.data.repository.core.support.RepositoryComposition$RepositoryFragments.invoke(RepositoryComposition.java:516) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.data.repository.core.support.RepositoryComposition.invoke(RepositoryComposition.java:285) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.data.repository.core.support.RepositoryFactorySupport$ImplementationMethodExecutionInterceptor.invoke(RepositoryFactorySupport.java:628) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.data.repository.core.support.QueryExecutorMethodInterceptor.doInvoke(QueryExecutorMethodInterceptor.java:168) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.data.repository.core.support.QueryExecutorMethodInterceptor.invoke(QueryExecutorMethodInterceptor.java:143) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.data.projection.DefaultMethodInvokingMethodInterceptor.invoke(DefaultMethodInvokingMethodInterceptor.java:70) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.transaction.interceptor.TransactionInterceptor$1.proceedWithInvocation(TransactionInterceptor.java:123) ~[spring-tx-6.1.4.jar:6.1.4]
        at org.springframework.transaction.interceptor.TransactionAspectSupport.invokeWithinTransaction(TransactionAspectSupport.java:385) ~[spring-tx-6.1.4.jar:6.1.4]
        at org.springframework.transaction.interceptor.TransactionInterceptor.invoke(TransactionInterceptor.java:119) ~[spring-tx-6.1.4.jar:6.1.4]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.dao.support.PersistenceExceptionTranslationInterceptor.invoke(PersistenceExceptionTranslationInterceptor.java:137) ~[spring-tx-6.1.4.jar:6.1.4]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.data.jpa.repository.support.CrudMethodMetadataPostProcessor$CrudMethodMetadataPopulatingMethodInterceptor.invoke(CrudMethodMetadataPostProcessor.java:164) ~[spring-data-jpa-3.2.3.jar:3.2.3]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.aop.interceptor.ExposeInvocationInterceptor.invoke(ExposeInvocationInterceptor.java:97) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.aop.framework.JdkDynamicAopProxy.invoke(JdkDynamicAopProxy.java:220) ~[spring-aop-6.1.4.jar:6.1.4]
        at jdk.proxy2/jdk.proxy2.$Proxy178.save(Unknown Source) ~[na:na]
        at com.agropecuariopos.backend.controllers.ProductController.createProduct(ProductController.java:24) ~[classes/:na]
        at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(Unknown Source) ~[na:na]
        at java.base/java.lang.reflect.Method.invoke(Unknown Source) ~[na:na]
        at org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:259) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:192) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:118) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.invokeHandlerMethod(RequestMappingHandlerAdapter.java:920) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.handleInternal(RequestMappingHandlerAdapter.java:830) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at org.springframework.web.servlet.mvc.method.AbstractHandlerMethodAdapter.handle(AbstractHandlerMethodAdapter.java:87) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089) ~[spring-webmvc-6.1.4.jar:6.1.4]     
        at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:979) ~[spring-webmvc-6.1.4.jar:6.1.4]       
        at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014) ~[spring-webmvc-6.1.4.jar:6.1.4]   
        at org.springframework.web.servlet.FrameworkServlet.doPost(FrameworkServlet.java:914) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:590) ~[tomcat-embed-core-10.1.19.jar:6.0]
        at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:885) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:658) ~[tomcat-embed-core-10.1.19.jar:6.0]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:205) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:51) ~[tomcat-embed-websocket-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:110) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:108) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.security.web.FilterChainProxy.lambda$doFilterInternal$3(FilterChainProxy.java:231) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:365) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.access.intercept.AuthorizationFilter.doFilter(AuthorizationFilter.java:100) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:126) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:120) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:131) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:85) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.authentication.AnonymousAuthenticationFilter.doFilter(AnonymousAuthenticationFilter.java:100) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter.doFilter(SecurityContextHolderAwareRequestFilter.java:179) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.savedrequest.RequestCacheAwareFilter.doFilter(RequestCacheAwareFilter.java:63) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at com.agropecuariopos.backend.security.jwt.AuthTokenFilter.doFilterInternal(AuthTokenFilter.java:52) ~[classes/:na]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:107) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:93) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.web.filter.CorsFilter.doFilterInternal(CorsFilter.java:91) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.header.HeaderWriterFilter.doHeadersAfter(HeaderWriterFilter.java:90) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.header.HeaderWriterFilter.doFilterInternal(HeaderWriterFilter.java:75) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:82) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:69) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter.doFilterInternal(WebAsyncManagerIntegrationFilter.java:62) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.session.DisableEncodeUrlFilter.doFilterInternal(DisableEncodeUrlFilter.java:42) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy.doFilterInternal(FilterChainProxy.java:233) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy.doFilter(FilterChainProxy.java:191) ~[spring-security-web-6.2.2.jar:6.2.2]   
        at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.servlet.handler.HandlerMappingIntrospector.lambda$createCacheFilter$3(HandlerMappingIntrospector.java:195) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.filter.CompositeFilter.doFilter(CompositeFilter.java:74) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.security.config.annotation.web.configuration.WebMvcSecurityConfiguration$CompositeFilterChainProxy.doFilter(WebMvcSecurityConfiguration.java:230) ~[spring-security-config-6.2.2.jar:6.2.2]
        at org.springframework.web.filter.DelegatingFilterProxy.invokeDelegate(DelegatingFilterProxy.java:352) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.filter.DelegatingFilterProxy.doFilter(DelegatingFilterProxy.java:268) ~[spring-web-6.1.4.jar:6.1.4]    
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93) ~[spring-web-6.1.4.jar:6.1.4]     
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:167) ~[tomcat-embed-core-10.1.19.jar:10.1.19]   
        at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:90) ~[tomcat-embed-core-10.1.19.jar:10.1.19]    
        at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:482) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:115) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:93) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:74) ~[tomcat-embed-core-10.1.19.jar:10.1.19]      
        at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:344) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:391) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:63) ~[tomcat-embed-core-10.1.19.jar:10.1.19]      
        at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:896) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1744) ~[tomcat-embed-core-10.1.19.jar:10.1.19]   
        at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52) ~[tomcat-embed-core-10.1.19.jar:10.1.19]       
        at org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1191) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:659) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:63) ~[tomcat-embed-core-10.1.19.jar:10.1.19]    
        at java.base/java.lang.Thread.run(Unknown Source) ~[na:na]

2026-03-11T22:02:46.528-06:00 ERROR 29568 --- [backend] [nio-8080-exec-1] c.a.b.security.jwt.AuthEntryPointJwt     : Unauthorized error: Full authentication is required to access this resource
2026-03-11T22:02:51.132-06:00 ERROR 29568 --- [backend] [nio-8080-exec-4] c.a.backend.security.jwt.JwtUtils        : JWT token is expired: JWT expired at 2026-03-10T18:09:41Z. Current time: 2026-03-12T04:02:51Z, a difference of 121990132 milliseconds.  Allowed clock skew: 0 milliseconds.
2026-03-11T22:02:51.152-06:00 ERROR 29568 --- [backend] [nio-8080-exec-4] o.a.c.c.C.[.[.[/].[dispatcherServlet]    : Servlet.service() for servlet [dispatcherServlet] in context with path [] threw exception [Request processing failed: jakarta.validation.ConstraintViolationException: Validation failed for classes [com.agropecuariopos.backend.models.Product] during persist time for groups [jakarta.validation.groups.Default, ]
List of constraint violations:[
        ConstraintViolationImpl{interpolatedMessage='el tamaño debe estar entre 13 y 13', propertyPath=cabysCode, rootBeanClass=class com.agropecuariopos.backend.models.Product, messageTemplate='{jakarta.validation.constraints.Size.message}'}
]] with root cause

jakarta.validation.ConstraintViolationException: Validation failed for classes [com.agropecuariopos.backend.models.Product] during persist time for groups [jakarta.validation.groups.Default, ]
List of constraint violations:[
        ConstraintViolationImpl{interpolatedMessage='el tamaño debe estar entre 13 y 13', propertyPath=cabysCode, rootBeanClass=class com.agropecuariopos.backend.models.Product, messageTemplate='{jakarta.validation.constraints.Size.message}'}
]
        at org.hibernate.boot.beanvalidation.BeanValidationEventListener.validate(BeanValidationEventListener.java:151) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.boot.beanvalidation.BeanValidationEventListener.onPreInsert(BeanValidationEventListener.java:81) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.action.internal.EntityIdentityInsertAction.preInsert(EntityIdentityInsertAction.java:186) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.action.internal.EntityIdentityInsertAction.execute(EntityIdentityInsertAction.java:75) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.engine.spi.ActionQueue.execute(ActionQueue.java:670) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.engine.spi.ActionQueue.addResolvedEntityInsertAction(ActionQueue.java:291) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.engine.spi.ActionQueue.addInsertAction(ActionQueue.java:272) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]       
        at org.hibernate.engine.spi.ActionQueue.addAction(ActionQueue.java:322) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.AbstractSaveEventListener.addInsertAction(AbstractSaveEventListener.java:386) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.AbstractSaveEventListener.performSaveOrReplicate(AbstractSaveEventListener.java:300) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.AbstractSaveEventListener.performSave(AbstractSaveEventListener.java:219) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.AbstractSaveEventListener.saveWithGeneratedId(AbstractSaveEventListener.java:134) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.DefaultPersistEventListener.entityIsTransient(DefaultPersistEventListener.java:175) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.DefaultPersistEventListener.persist(DefaultPersistEventListener.java:93) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.DefaultPersistEventListener.onPersist(DefaultPersistEventListener.java:77) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.internal.DefaultPersistEventListener.onPersist(DefaultPersistEventListener.java:54) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.event.service.internal.EventListenerGroupImpl.fireEventOnEachListener(EventListenerGroupImpl.java:127) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.internal.SessionImpl.firePersist(SessionImpl.java:754) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at org.hibernate.internal.SessionImpl.persist(SessionImpl.java:738) ~[hibernate-core-6.4.4.Final.jar:6.4.4.Final]
        at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(Unknown Source) ~[na:na]
        at java.base/java.lang.reflect.Method.invoke(Unknown Source) ~[na:na]
        at org.springframework.orm.jpa.ExtendedEntityManagerCreator$ExtendedEntityManagerInvocationHandler.invoke(ExtendedEntityManagerCreator.java:364) ~[spring-orm-6.1.4.jar:6.1.4]
        at jdk.proxy2/jdk.proxy2.$Proxy159.persist(Unknown Source) ~[na:na]
        at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(Unknown Source) ~[na:na]
        at java.base/java.lang.reflect.Method.invoke(Unknown Source) ~[na:na]
        at org.springframework.orm.jpa.SharedEntityManagerCreator$SharedEntityManagerInvocationHandler.invoke(SharedEntityManagerCreator.java:319) ~[spring-orm-6.1.4.jar:6.1.4]
        at jdk.proxy2/jdk.proxy2.$Proxy159.persist(Unknown Source) ~[na:na]
        at org.springframework.data.jpa.repository.support.SimpleJpaRepository.save(SimpleJpaRepository.java:618) ~[spring-data-jpa-3.2.3.jar:3.2.3]
        at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(Unknown Source) ~[na:na]
        at java.base/java.lang.reflect.Method.invoke(Unknown Source) ~[na:na]
        at org.springframework.aop.support.AopUtils.invokeJoinpointUsingReflection(AopUtils.java:351) ~[spring-aop-6.1.4.jar:6.1.4]       
        at org.springframework.data.repository.core.support.RepositoryMethodInvoker$RepositoryFragmentMethodInvoker.lambda$new$0(RepositoryMethodInvoker.java:277) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.data.repository.core.support.RepositoryMethodInvoker.doInvoke(RepositoryMethodInvoker.java:170) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.data.repository.core.support.RepositoryMethodInvoker.invoke(RepositoryMethodInvoker.java:158) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.data.repository.core.support.RepositoryComposition$RepositoryFragments.invoke(RepositoryComposition.java:516) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.data.repository.core.support.RepositoryComposition.invoke(RepositoryComposition.java:285) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.data.repository.core.support.RepositoryFactorySupport$ImplementationMethodExecutionInterceptor.invoke(RepositoryFactorySupport.java:628) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.data.repository.core.support.QueryExecutorMethodInterceptor.doInvoke(QueryExecutorMethodInterceptor.java:168) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.data.repository.core.support.QueryExecutorMethodInterceptor.invoke(QueryExecutorMethodInterceptor.java:143) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.data.projection.DefaultMethodInvokingMethodInterceptor.invoke(DefaultMethodInvokingMethodInterceptor.java:70) ~[spring-data-commons-3.2.3.jar:3.2.3]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.transaction.interceptor.TransactionInterceptor$1.proceedWithInvocation(TransactionInterceptor.java:123) ~[spring-tx-6.1.4.jar:6.1.4]
        at org.springframework.transaction.interceptor.TransactionAspectSupport.invokeWithinTransaction(TransactionAspectSupport.java:385) ~[spring-tx-6.1.4.jar:6.1.4]
        at org.springframework.transaction.interceptor.TransactionInterceptor.invoke(TransactionInterceptor.java:119) ~[spring-tx-6.1.4.jar:6.1.4]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.dao.support.PersistenceExceptionTranslationInterceptor.invoke(PersistenceExceptionTranslationInterceptor.java:137) ~[spring-tx-6.1.4.jar:6.1.4]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.data.jpa.repository.support.CrudMethodMetadataPostProcessor$CrudMethodMetadataPopulatingMethodInterceptor.invoke(CrudMethodMetadataPostProcessor.java:164) ~[spring-data-jpa-3.2.3.jar:3.2.3]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.aop.interceptor.ExposeInvocationInterceptor.invoke(ExposeInvocationInterceptor.java:97) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.aop.framework.ReflectiveMethodInvocation.proceed(ReflectiveMethodInvocation.java:184) ~[spring-aop-6.1.4.jar:6.1.4]
        at org.springframework.aop.framework.JdkDynamicAopProxy.invoke(JdkDynamicAopProxy.java:220) ~[spring-aop-6.1.4.jar:6.1.4]
        at jdk.proxy2/jdk.proxy2.$Proxy178.save(Unknown Source) ~[na:na]
        at com.agropecuariopos.backend.controllers.ProductController.createProduct(ProductController.java:24) ~[classes/:na]
        at java.base/jdk.internal.reflect.DirectMethodHandleAccessor.invoke(Unknown Source) ~[na:na]
        at java.base/java.lang.reflect.Method.invoke(Unknown Source) ~[na:na]
        at org.springframework.web.method.support.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:259) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.method.support.InvocableHandlerMethod.invokeForRequest(InvocableHandlerMethod.java:192) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.servlet.mvc.method.annotation.ServletInvocableHandlerMethod.invokeAndHandle(ServletInvocableHandlerMethod.java:118) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.invokeHandlerMethod(RequestMappingHandlerAdapter.java:920) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerAdapter.handleInternal(RequestMappingHandlerAdapter.java:830) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at org.springframework.web.servlet.mvc.method.AbstractHandlerMethodAdapter.handle(AbstractHandlerMethodAdapter.java:87) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at org.springframework.web.servlet.DispatcherServlet.doDispatch(DispatcherServlet.java:1089) ~[spring-webmvc-6.1.4.jar:6.1.4]     
        at org.springframework.web.servlet.DispatcherServlet.doService(DispatcherServlet.java:979) ~[spring-webmvc-6.1.4.jar:6.1.4]       
        at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014) ~[spring-webmvc-6.1.4.jar:6.1.4]   
        at org.springframework.web.servlet.FrameworkServlet.doPost(FrameworkServlet.java:914) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:590) ~[tomcat-embed-core-10.1.19.jar:6.0]
        at org.springframework.web.servlet.FrameworkServlet.service(FrameworkServlet.java:885) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at jakarta.servlet.http.HttpServlet.service(HttpServlet.java:658) ~[tomcat-embed-core-10.1.19.jar:6.0]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:205) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.tomcat.websocket.server.WsFilter.doFilter(WsFilter.java:51) ~[tomcat-embed-websocket-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:110) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:108) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.security.web.FilterChainProxy.lambda$doFilterInternal$3(FilterChainProxy.java:231) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:365) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.access.intercept.AuthorizationFilter.doFilter(AuthorizationFilter.java:100) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:126) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.access.ExceptionTranslationFilter.doFilter(ExceptionTranslationFilter.java:120) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:131) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.session.SessionManagementFilter.doFilter(SessionManagementFilter.java:85) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.authentication.AnonymousAuthenticationFilter.doFilter(AnonymousAuthenticationFilter.java:100) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.servletapi.SecurityContextHolderAwareRequestFilter.doFilter(SecurityContextHolderAwareRequestFilter.java:179) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.savedrequest.RequestCacheAwareFilter.doFilter(RequestCacheAwareFilter.java:63) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at com.agropecuariopos.backend.security.jwt.AuthTokenFilter.doFilterInternal(AuthTokenFilter.java:52) ~[classes/:na]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:107) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.authentication.logout.LogoutFilter.doFilter(LogoutFilter.java:93) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.web.filter.CorsFilter.doFilterInternal(CorsFilter.java:91) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.header.HeaderWriterFilter.doHeadersAfter(HeaderWriterFilter.java:90) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.header.HeaderWriterFilter.doFilterInternal(HeaderWriterFilter.java:75) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:82) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.context.SecurityContextHolderFilter.doFilter(SecurityContextHolderFilter.java:69) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.context.request.async.WebAsyncManagerIntegrationFilter.doFilterInternal(WebAsyncManagerIntegrationFilter.java:62) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.session.DisableEncodeUrlFilter.doFilterInternal(DisableEncodeUrlFilter.java:42) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.springframework.security.web.FilterChainProxy$VirtualFilterChain.doFilter(FilterChainProxy.java:374) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy.doFilterInternal(FilterChainProxy.java:233) ~[spring-security-web-6.2.2.jar:6.2.2]
        at org.springframework.security.web.FilterChainProxy.doFilter(FilterChainProxy.java:191) ~[spring-security-web-6.2.2.jar:6.2.2]   
        at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.servlet.handler.HandlerMappingIntrospector.lambda$createCacheFilter$3(HandlerMappingIntrospector.java:195) ~[spring-webmvc-6.1.4.jar:6.1.4]
        at org.springframework.web.filter.CompositeFilter$VirtualFilterChain.doFilter(CompositeFilter.java:113) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.filter.CompositeFilter.doFilter(CompositeFilter.java:74) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.security.config.annotation.web.configuration.WebMvcSecurityConfiguration$CompositeFilterChainProxy.doFilter(WebMvcSecurityConfiguration.java:230) ~[spring-security-config-6.2.2.jar:6.2.2]
        at org.springframework.web.filter.DelegatingFilterProxy.invokeDelegate(DelegatingFilterProxy.java:352) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.filter.DelegatingFilterProxy.doFilter(DelegatingFilterProxy.java:268) ~[spring-web-6.1.4.jar:6.1.4]    
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.springframework.web.filter.RequestContextFilter.doFilterInternal(RequestContextFilter.java:100) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.springframework.web.filter.FormContentFilter.doFilterInternal(FormContentFilter.java:93) ~[spring-web-6.1.4.jar:6.1.4]     
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.springframework.web.filter.CharacterEncodingFilter.doFilterInternal(CharacterEncodingFilter.java:201) ~[spring-web-6.1.4.jar:6.1.4]
        at org.springframework.web.filter.OncePerRequestFilter.doFilter(OncePerRequestFilter.java:116) ~[spring-web-6.1.4.jar:6.1.4]      
        at org.apache.catalina.core.ApplicationFilterChain.internalDoFilter(ApplicationFilterChain.java:174) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.ApplicationFilterChain.doFilter(ApplicationFilterChain.java:149) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.StandardWrapperValve.invoke(StandardWrapperValve.java:167) ~[tomcat-embed-core-10.1.19.jar:10.1.19]   
        at org.apache.catalina.core.StandardContextValve.invoke(StandardContextValve.java:90) ~[tomcat-embed-core-10.1.19.jar:10.1.19]    
        at org.apache.catalina.authenticator.AuthenticatorBase.invoke(AuthenticatorBase.java:482) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.StandardHostValve.invoke(StandardHostValve.java:115) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.valves.ErrorReportValve.invoke(ErrorReportValve.java:93) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.catalina.core.StandardEngineValve.invoke(StandardEngineValve.java:74) ~[tomcat-embed-core-10.1.19.jar:10.1.19]      
        at org.apache.catalina.connector.CoyoteAdapter.service(CoyoteAdapter.java:344) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.coyote.http11.Http11Processor.service(Http11Processor.java:391) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.coyote.AbstractProcessorLight.process(AbstractProcessorLight.java:63) ~[tomcat-embed-core-10.1.19.jar:10.1.19]      
        at org.apache.coyote.AbstractProtocol$ConnectionHandler.process(AbstractProtocol.java:896) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.tomcat.util.net.NioEndpoint$SocketProcessor.doRun(NioEndpoint.java:1744) ~[tomcat-embed-core-10.1.19.jar:10.1.19]   
        at org.apache.tomcat.util.net.SocketProcessorBase.run(SocketProcessorBase.java:52) ~[tomcat-embed-core-10.1.19.jar:10.1.19]       
        at org.apache.tomcat.util.threads.ThreadPoolExecutor.runWorker(ThreadPoolExecutor.java:1191) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.tomcat.util.threads.ThreadPoolExecutor$Worker.run(ThreadPoolExecutor.java:659) ~[tomcat-embed-core-10.1.19.jar:10.1.19]
        at org.apache.tomcat.util.threads.TaskThread$WrappingRunnable.run(TaskThread.java:63) ~[tomcat-embed-core-10.1.19.jar:10.1.19]    
        at java.base/java.lang.Thread.run(Unknown Source) ~[na:na]

2026-03-11T22:02:51.167-06:00 ERROR 29568 --- [backend] [nio-8080-exec-4] c.a.b.security.jwt.AuthEntryPointJwt     : Unauthorized error: Full authentication is required to access this resource
2026-03-11T22:03:03.672-06:00 DEBUG 29568 --- [backend] [   scheduling-1] org.hibernate.SQL                        : 
    select
        ei1_0.id,
        ei1_0.clave,
        ei1_0.created_at,
        ei1_0.estado,
        ei1_0.fecha_envio,
        ei1_0.fecha_respuesta,
        ei1_0.intentos_envio,
        ei1_0.mensaje_respuesta,
        ei1_0.numero_consecutivo,
        ei1_0.sale_id,
        ei1_0.tipo_comprobante,
        ei1_0.xml_firmado_base64,
        ei1_0.xml_generado,
        ei1_0.xml_respuesta_hacienda
    from
        electronic_invoices ei1_0
    where
        ei1_0.estado='ENVIADO'
        and ei1_0.intentos_envio<5
